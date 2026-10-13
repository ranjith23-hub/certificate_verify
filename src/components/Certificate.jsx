// A4 certificate (794 x 1123 px). Used for the on-screen preview and the PDF.
const dmy = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '')
const up = (s) => (s || '').toUpperCase()

function Row({ cells }) {
  return (
    <tr>
      {cells.map((c, i) => (
        <td key={i} className={i % 2 === 0 ? 'lbl' : ''}>{c}</td>
      ))}
    </tr>
  )
}

export default function Certificate({ cert }) {
  const c = cert.customers || {}
  const p = cert.products || {}
  const m = cert.master_calibrators || {}
  const s = cert.standard_calibrators || {}
  const customerLine = [c.name, c.dealer && `${c.dealer} DEALER`, c.address].filter(Boolean).join(', ')

  return (
    <div className="cert">
      <img className="cert-head" src="/letterhead.png" alt="" />

      <h1>CALIBRATION CERTIFICATE</h1>
      <p className="sub">({up(p.item_description)})</p>

      <div className="meta">
        <b>Certificate No: {cert.cert_no}</b>
        <b>Date: {dmy(cert.cal_date)}</b>
      </div>

      <p className="cust"><b>CUSTOMER NAME: {up(customerLine)}</b></p>

      <table>
        <tbody>
          <Row cells={['Description of the Item', p.item_description, 'Range', p.item_range]} />
          <Row cells={['Sl. No. / ID. No.', p.id_no, 'Date of Calibration', dmy(cert.cal_date)]} />
          <Row cells={['MAKE', 'ICON EMBEDED CONTROLS', 'Environmental Condition', cert.env_condition]} />
          <Row cells={['MODEL', p.item_model, 'Next Calibration Date', dmy(cert.next_cal_date)]} />
        </tbody>
      </table>

      <div className="two">
        <div>
          <h3>MASTER CALIBRATOR DETAILS</h3>
          <table>
            <tbody>
              <Row cells={['Name', m.name]} />
              <Row cells={['Make', m.make]} />
              <Row cells={['Model', m.model]} />
              <Row cells={['Serial Number', m.serial_number]} />
              <Row cells={['Certificate Number', m.certificate_number]} />
            </tbody>
          </table>
        </div>
        <div>
          <h3>STANDARD CALIBRATOR DETAILS</h3>
          <table>
            <tbody>
              <Row cells={['Name', s.name]} />
              <Row cells={['Make', s.make]} />
              <Row cells={['ID. No. & SL. NO.', s.id_sl_no]} />
              <Row cells={['Reference Standard', s.reference_standard]} />
              <Row cells={['Certificate Number', s.certificate_number]} />
            </tbody>
          </table>
        </div>
      </div>

      <p className="res"><b>Calibration result:</b></p>
      <p className="res">{cert.result_text}</p>

      <p className="by"><b>CALIBRATION DONE BY:</b> {cert.done_by}, ENGINEER, ICON EMBEDED CONTROLS.</p>
      <p className="by"><b>CONFIRMED BY: {cert.confirmed_by}</b></p>

      <div className="sign">
        <b>For ICON EMBEDED CONTROLS</b>
          {/* <img src="/stamp.png" alt="" /> */}
        <b>(AUTHORISED SIGNATORY)</b>
      </div>

      <div className="foot">
        No. 374/2, Jothi Nagar 2nd Street, Ramanuja Nagar Extn, Uppilipalayam Post, Coimbatore - 641 015. Tamil Nadu<br />
        <b>Phone : +91-422-2596032 Mobile : +91-9751456032 E-mail : info@iconembededcontrols.com | iconembededcontrols@yahoo.com</b>
      </div>
    </div>
  )
}
