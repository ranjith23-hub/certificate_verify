import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login.jsx'
import VerifyCertificates from './pages/VerifyCertificates.jsx'

// Add future tabs here (e.g. New Certificate, Requests).
const TABS = [{ id: 'verify', label: 'Verify Certificates', component: VerifyCertificates }]

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const [tab, setTab] = useState(TABS[0].id)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <p className="center muted">Loading…</p>
  if (!session) return <Login />

  const Active = TABS.find((t) => t.id === tab).component

  return (
    <div className="app">
      <header className="topbar">
        <img className="brand" src="/logo.png" alt="Icon Embeded Controls" />
        <nav>
          {TABS.map((t) => (
            <button
              key={t.id}
              className={t.id === tab ? 'tab on' : 'tab'}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button className="btn ghost" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </header>
      <main>
        <Active />
      </main>
    </div>
  )
}
