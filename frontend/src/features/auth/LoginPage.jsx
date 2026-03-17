import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ACCOUNTS } from '../../data/accounts'

export default function LoginPage() {
  const { role } = useParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const isVendor = role === 'vendor'

  const handleSubmit = (e) => {
    e.preventDefault()
    const ok = login(role, email, password)
    if (!ok) { setError(true); return }
    navigate(isVendor ? '/vendor' : '/claimant')
  }

  const demoAccounts = ACCOUNTS[role] ?? []

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FAF6F0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: '#A33328', height: 58, display: 'flex', alignItems: 'center', padding: '0 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.026) 15px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
          <div style={{ width: 30, height: 30, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.5 2 3 4 3 7c0 2 1.5 4 5 6 3.5-2 5-4 5-6 0-3-2.5-5-5-5z" fill="white" /></svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#fff' }}>
            Food<span style={{ color: '#9FE1CB' }}>Rescue</span>
          </span>
        </div>
        <div style={{ zIndex: 1, marginLeft: 16, height: 18, width: 1, background: 'rgba(255,255,255,0.15)' }} />
        <span style={{ zIndex: 1, marginLeft: 16, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9FE1CB', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', padding: '3px 10px', borderRadius: 20 }}>
          {isVendor ? 'Vendor' : 'Claimant'}
        </span>
      </nav>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 400 }}>

          {/* Icon + heading */}
          <div style={{ width: 44, height: 44, background: isVendor ? '#C8473A' : '#1D9E75', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            {isVendor
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2.5" stroke="white" strokeWidth="1.5" /><path d="M6 5V4a4 4 0 018 0v1" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM3 16c0-3 3.13-5 7-5s7 2 7 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
            }
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {isVendor ? 'Vendor Login' : 'Claimant Login'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B6560', marginBottom: 28, fontWeight: 300 }}>
            {isVendor ? 'Sign in to manage your food listings.' : 'Sign in to browse and reserve surplus food.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 5 }}>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false) }}
                required
                style={{ width: '100%', fontSize: 13, padding: '10px 12px', border: '0.5px solid rgba(0,0,0,0.14)', borderRadius: 9, background: '#F5F3EF', color: '#1A1A1A', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 6 }}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 5 }}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false) }}
                required
                style={{ width: '100%', fontSize: 13, padding: '10px 12px', border: '0.5px solid rgba(0,0,0,0.14)', borderRadius: 9, background: '#F5F3EF', color: '#1A1A1A', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            {error && <p style={{ fontSize: 12, color: '#A32D2D', marginBottom: 10 }}>Incorrect email or password. Please try again.</p>}

            <button
              type="submit"
              style={{ width: '100%', marginTop: 16, background: isVendor ? '#C8473A' : '#1D9E75', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              Sign in
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8.5 4l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ fontSize: 12, color: '#6B6560', textDecoration: 'none' }}>← Back to home</Link>
          </div>

          {/* Demo accounts */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#aaa', textAlign: 'center', marginBottom: 12 }}>Demo accounts</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => { setEmail(a.email); setPassword(a.password); setError(false) }}
                  style={{ textAlign: 'left', fontSize: 12, color: '#6B6560', background: '#F5F3EF', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                >
                  <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{a.name}</span>
                  <span style={{ color: '#aaa', marginLeft: 8 }}>{a.email} / {a.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
