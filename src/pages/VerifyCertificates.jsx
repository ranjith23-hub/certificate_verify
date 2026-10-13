import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CONFIRMED_BY_LIST } from '../constants'
import Certificate from '../components/Certificate.jsx'
import { downloadCertificatePdf } from '../lib/pdf.jsx'

const SELECT = `id, cert_no, cal_date, next_cal_date, env_condition, result_text, done_by,
  confirmed_by, verified_at, created_at, is_verified,
  master_calibrators(name, make, model, serial_number, certificate_number),
  standard_calibrators(name, make, id_sl_no, reference_standard, certificate_number),
  customers(name, address, phone, gstin, dealer),
  products(item_description, item_model, item_range, id_no)`

const dmy = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—')

function ScaledPreview({ cert }) {
  const box = useRef(null)
  const [scale, setScale] = useState(0.7)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setScale(Math.min(1, (e.contentRect.width - 8) / 794)))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className="preview-box">
      <div style={{ width: 794 * scale, height: 1123 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 794 }}>
          <Certificate cert={cert} />
        </div>
      </div>
    </div>
  )
}

export default function VerifyCertificates() {
  const [view, setView] = useState('pending')
  const [rows, setRows] = useState([])
  const [counts, setCounts] = useState({ pending: null, verified: null })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmedBy, setConfirmedBy] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const pending = view === 'pending'
    const { data, error } = await supabase
      .from('certificates')
      .select(SELECT)
      .eq('is_verified', !pending)
      .order(pending ? 'created_at' : 'verified_at', { ascending: false })
    if (error) setError(error.message)
    else {
      setRows(data)
      setCounts((c) => ({ ...c, [view]: data.length }))
    }
    setLoading(false)
  }, [view])

  useEffect(() => { load() }, [load])

  const q = search.trim().toLowerCase()
  const shown = rows.filter((r) =>
    !q || [r.cert_no, r.customers?.name, r.products?.item_description, r.products?.item_model]
      .some((v) => (v || '').toLowerCase().includes(q))
  )

  function open(row) {
    setSelected(row)
    setConfirmedBy('')
    setModalError('')
  }

  async function verifyAndDownload() {
    if (!confirmedBy) return setModalError('Choose who is confirming this certificate.')
    setSaving(true)
    setModalError('')
    const verifiedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('certificates')
      .update({ is_verified: true, confirmed_by: confirmedBy, verified_at: verifiedAt })
      .eq('id', selected.id)
      .eq('is_verified', false) // skip if someone else verified it first
      .select('id')
    if (error) { setSaving(false); return setModalError(error.message) }
    if (!data?.length) { setSaving(false); return setModalError('This certificate was already verified.') }

    const done = { ...selected, is_verified: true, confirmed_by: confirmedBy, verified_at: verifiedAt }
    setRows((r) => r.filter((x) => x.id !== selected.id))
    setCounts((c) => ({ pending: (c.pending ?? 1) - 1, verified: c.verified == null ? null : c.verified + 1 }))
    try {
      await downloadCertificatePdf(done)
    } catch (e) {
      setError('Verified, but the PDF failed to generate. Open the Verified tab to download it again.')
    }
    setSaving(false)
    setSelected(null)
  }

  async function download(row) {
    setBusyId(row.id)
    try { await downloadCertificatePdf(row) } catch { setError('Could not generate the PDF.') }
    setBusyId(null)
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Certificates</h2>
          <p className="muted">Review each certificate, verify it and download the PDF.</p>
        </div>
        <button className="btn" onClick={load} disabled={loading}>↻ Refresh</button>
      </div>

      <div className="toolbar">
        <div className="seg">
          {['pending', 'verified'].map((v) => (
            <button key={v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>
              {v === 'pending' ? 'Pending' : 'Verified'}
              {counts[v] != null && <span className="count">{counts[v]}</span>}
            </button>
          ))}
        </div>
        <input
          className="search"
          placeholder="Search cert no, customer, item…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="empty">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="empty">
          {rows.length === 0
            ? view === 'pending' ? '🎉 Nothing waiting for verification.' : 'No verified certificates yet.'
            : 'No certificates match your search.'}
        </div>
      ) : (
        <div className="list">
          {shown.map((r) => (
            <div className="item" key={r.id}>
              <div className="item-main">
                <div className="item-top">
                  <b>{r.cert_no || 'No number'}</b>
                  <span className={view === 'pending' ? 'chip warn' : 'chip ok'}>
                    {view === 'pending' ? 'Pending' : 'Verified'}
                  </span>
                </div>
                <div className="cust">{r.customers?.name || '—'}</div>
                <div className="muted">
                  {[r.products?.item_description, r.products?.item_model].filter(Boolean).join(' · ') || '—'}
                </div>
              </div>
              <div className="item-dates">
                <div><span className="muted">Calibrated</span> {dmy(r.cal_date)}</div>
                <div><span className="muted">Next due</span> {dmy(r.next_cal_date)}</div>
              </div>
              <div className="item-by">
                <div><span className="muted">Done by</span> {r.done_by || '—'}</div>
                {view === 'verified' && <div><span className="muted">Confirmed by</span> {r.confirmed_by || '—'}</div>}
              </div>
              {view === 'pending' ? (
                <button className="btn primary" onClick={() => open(r)}>Review & verify</button>
              ) : (
                <button className="btn" onClick={() => download(r)} disabled={busyId === r.id}>
                  {busyId === r.id ? 'Preparing…' : '⬇ PDF'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="overlay">
          <div className="sheet">
            <aside className="side">
              <button className="btn ghost" onClick={() => !saving && setSelected(null)}>← Back</button>
              <h3>Verify certificate</h3>
              <div className="big">{selected.cert_no}</div>
              <dl>
                <dt>Customer</dt><dd>{selected.customers?.name || '—'}</dd>
                <dt>Item</dt><dd>{selected.products?.item_description} {selected.products?.item_model}</dd>
                <dt>Done by</dt><dd>{selected.done_by || '—'}</dd>
              </dl>
              <label>
                Confirmed by
                <select value={confirmedBy} onChange={(e) => setConfirmedBy(e.target.value)}>
                  <option value="">Select a name…</option>
                  {CONFIRMED_BY_LIST.map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              {modalError && <div className="alert">{modalError}</div>}
              <button className="btn primary wide" onClick={verifyAndDownload} disabled={saving}>
                {saving ? 'Verifying…' : 'Verify & download PDF'}
              </button>
              <p className="muted small">The preview updates as you pick a name. Check it carefully, since verifying can't be undone from here.</p>
            </aside>
            <div className="main-preview">
              <ScaledPreview cert={{ ...selected, confirmed_by: confirmedBy }} />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
