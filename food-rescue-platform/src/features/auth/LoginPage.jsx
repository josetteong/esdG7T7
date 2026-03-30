import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { role } = useParams() // 'vendor' | 'claimant'
  const { login, signup } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('signin') // 'signin' | 'signup'

  // Sign-in fields
  const [siEmail, setSiEmail]       = useState('')
  const [siPassword, setSiPassword] = useState('')
  const [siError, setSiError]       = useState('')
  const [siLoading, setSiLoading]   = useState(false)

  // Sign-up fields
  const [suName, setSuName]         = useState('')
  const [suEmail, setSuEmail]       = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm]   = useState('')
  const [suError, setSuError]       = useState('')
  const [suLoading, setSuLoading]   = useState(false)

  const isVendor = role === 'vendor'
  const accentColor = isVendor ? '#C8473A' : '#1D9E75'
  const dest = isVendor ? '/vendor' : '/claimant'

  // Shared demo account hints (sign-in only)
  const demos = isVendor
    ? [{ email: 'bakery@example.com', password: 'pass123', name: 'Sunshine Bakery' },
       { email: 'supermart@example.com', password: 'pass123', name: 'SuperMart SG' }]
    : [{ email: 'ngo@example.com', password: 'pass123', name: 'Hope NGO' },
       { email: 'beneficiary@example.com', password: 'pass123', name: 'Jane Lim' }]

  const handleSignIn = async (e) => {
    e.preventDefault()
    setSiError('')
    setSiLoading(true)
    const result = await login(role, siEmail, siPassword)
    setSiLoading(false)
    if (!result.ok) { setSiError(result.error); return }
    navigate(dest)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setSuError('')
    if (suPassword !== suConfirm) { setSuError('Passwords do not match.'); return }
    setSuLoading(true)
    const result = await signup(role, suName, suEmail, suPassword)
    setSuLoading(false)
    if (!result.ok) { setSuError(result.error); return }
    navigate(dest)
  }

  const inputStyle = {
    width: '100%', fontSize: 13, padding: '10px 12px',
    border: '0.5px solid rgba(0,0,0,0.14)', borderRadius: 9,
    background: '#F5F3EF', color: '#1A1A1A', fontFamily: 'inherit', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 500,
    letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 5,
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FAF6F0', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ background: '#A33328', height: 58, display: 'flex', alignItems: 'center', padding: '0 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.026) 15px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
          <div style={{ width: 30, height: 30, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.5 2 3 4 3 7c0 2 1.5 4 5 6 3.5-2 5-4 5-6 0-3-2.5-5-5-5z" fill="white" /></svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#fff' }}>Food<span style={{ color: '#9FE1CB' }}>Rescue</span></span>
        </div>
        <div style={{ zIndex: 1, marginLeft: 16, height: 18, width: 1, background: 'rgba(255,255,255,0.15)' }} />
        <span style={{ zIndex: 1, marginLeft: 16, fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9FE1CB', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', padding: '3px 10px', borderRadius: 20 }}>
          {isVendor ? 'Vendor' : 'Claimant'}
        </span>
      </nav>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 420 }}>

          {/* Role icon */}
          <div style={{ width: 44, height: 44, background: isVendor ? '#FAECE7' : '#E1F5EE', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            {isVendor
              ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2.5" stroke="#C8473A" strokeWidth="1.5" /><path d="M6 5V4a4 4 0 018 0v1" stroke="#C8473A" strokeWidth="1.5" strokeLinecap="round" /></svg>
              : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM3 16c0-3 3.13-5 7-5s7 2 7 5" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" /></svg>
            }
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#F5F3EF', borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {[['signin', 'Sign in'], ['signup', 'Sign up']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setSiError(''); setSuError('') }}
                style={{
                  flex: 1, padding: '8px 0', fontSize: 13, fontWeight: 500,
                  border: 'none', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit',
                  background: tab === key ? '#fff' : 'transparent',
                  color: tab === key ? '#1A1A1A' : '#6B6560',
                  boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── SIGN IN ── */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" required placeholder="you@example.com" value={siEmail}
                  onChange={(e) => { setSiEmail(e.target.value); setSiError('') }}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={labelStyle}>Password</label>
                <input type="password" required placeholder="••••••••" value={siPassword}
                  onChange={(e) => { setSiPassword(e.target.value); setSiError('') }}
                  style={inputStyle} />
              </div>
              {siError && <p style={{ fontSize: 12, color: '#A32D2D', margin: '8px 0 12px' }}>{siError}</p>}
              <button type="submit" disabled={siLoading} style={{ width: '100%', marginTop: 16, background: siLoading ? '#aaa' : accentColor, color: '#fff', border: 'none', borderRadius: 10, padding: 11, fontSize: 14, fontWeight: 500, cursor: siLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {siLoading ? 'Signing in…' : 'Sign in'}
                {!siLoading && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8.5 4l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>

              {/* Demo accounts */}
              <div style={{ marginTop: 24, paddingTop: 18, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bbb', textAlign: 'center', marginBottom: 10 }}>Demo accounts</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {demos.map((a) => (
                    <button key={a.email} type="button"
                      onClick={() => { setSiEmail(a.email); setSiPassword(a.password); setSiError('') }}
                      style={{ textAlign: 'left', fontSize: 12, color: '#6B6560', background: '#F5F3EF', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{a.name}</span>
                      <span style={{ color: '#aaa', marginLeft: 8 }}>{a.email} / {a.password}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{isVendor ? 'Business / organisation name' : 'Your name'}</label>
                <input type="text" required placeholder={isVendor ? 'e.g. Sunshine Bakery' : 'e.g. Jane Lim'} value={suName}
                  onChange={(e) => { setSuName(e.target.value); setSuError('') }}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email</label>
                <input type="email" required placeholder="you@example.com" value={suEmail}
                  onChange={(e) => { setSuEmail(e.target.value); setSuError('') }}
                  style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 6 }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input type="password" required placeholder="Min. 6 chars" value={suPassword}
                    onChange={(e) => { setSuPassword(e.target.value); setSuError('') }}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm</label>
                  <input type="password" required placeholder="Repeat password" value={suConfirm}
                    onChange={(e) => { setSuConfirm(e.target.value); setSuError('') }}
                    style={inputStyle} />
                </div>
              </div>
              {suError && <p style={{ fontSize: 12, color: '#A32D2D', margin: '8px 0 12px' }}>{suError}</p>}

              {/* Role note */}
              <div style={{ background: '#F5F3EF', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#6B6560', marginBottom: 16, marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, marginTop: 1 }}>ℹ️</span>
                <span>
                  {isVendor
                    ? 'You are signing up as a Vendor. You will be able to post surplus food listings.'
                    : 'You are signing up as a Claimant. You will be able to browse and reserve listings.'
                  }
                </span>
              </div>

              <button type="submit" disabled={suLoading} style={{ width: '100%', background: suLoading ? '#aaa' : accentColor, color: '#fff', border: 'none', borderRadius: 10, padding: 11, fontSize: 14, fontWeight: 500, cursor: suLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                {suLoading ? 'Creating account…' : 'Create account'}
                {!suLoading && <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8.5 4l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/" style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
