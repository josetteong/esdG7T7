import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: '#FAF6F0', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAV ── */}
      <nav style={{ background: '#A33328', height: 58, display: 'flex', alignItems: 'center', padding: '0 32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.026) 15px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, zIndex: 1 }}>
          <div style={{ width: 32, height: 32, background: '#1D9E75', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2C5.5 2 3 4 3 7c0 2 1.5 4 5 6 3.5-2 5-4 5-6 0-3-2.5-5-5-5z" fill="white" /></svg>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: '#fff', letterSpacing: '-0.01em' }}>
            Food<span style={{ color: '#9FE1CB' }}>Rescue</span>
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, zIndex: 1 }}>
          {['How it works', 'For vendors', 'For NGOs'].map((l) => (
            <button key={l} style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', background: 'none', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
          ))}
          <button onClick={() => navigate('/login/vendor')} style={{ fontSize: 13, fontWeight: 500, color: '#A33328', background: '#fff', border: 'none', padding: '7px 18px', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit' }}>Sign in →</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 58px)', maxWidth: 1200, margin: '0 auto', padding: '0 32px', alignItems: 'center' }}>

        {/* Left copy */}
        <div style={{ padding: '60px 48px 60px 0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C8473A', marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C8473A' }} />
            Singapore's food rescue network
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px,4.5vw,58px)', fontWeight: 900, lineHeight: 1.08, color: '#1A1A1A', marginBottom: 20, letterSpacing: '-0.02em' }}>
            Good food<br />
            <span style={{ color: '#C8473A' }}>deserves a</span><br />
            second chance.
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#6B6560', maxWidth: 400, marginBottom: 36, fontWeight: 300 }}>
            Connect surplus pastries, meals and produce with NGOs and beneficiaries who need them — before they go to waste.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login/vendor')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#C8473A', color: '#fff', fontSize: 14, fontWeight: 500, padding: '12px 26px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="9" rx="1.5" stroke="white" strokeWidth="1.4" /><path d="M4 3V2.5a3 3 0 016 0V3" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg>
              I'm a vendor
            </button>
            <button onClick={() => navigate('/login/claimant')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#1A1A1A', fontSize: 14, fontWeight: 500, padding: '12px 26px', borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 4.5a3 3 0 11-6 0 3 3 0 016 0zM2 12c0-2.21 2.24-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
              I'm a claimant
            </button>
          </div>

          {/* Trust strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 36, fontSize: 12, color: '#6B6560' }}>
            <div style={{ display: 'flex' }}>
              {[['#C8473A','SB'],['#1D9E75','NG'],['#185FA5','JL'],['#BA7517','SM']].map(([bg, initials], i) => (
                <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: bg, border: '2px solid #FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: '#fff', marginRight: -7, zIndex: 4 - i, position: 'relative' }}>{initials}</div>
              ))}
            </div>
            <span style={{ marginLeft: 8 }}>Trusted by 40+ vendors and NGOs across Singapore</span>
          </div>
        </div>

        {/* Right illustration */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 520 }}>
          <div style={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', background: '#C8473A', opacity: 0.08, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: '#C8473A', opacity: 0.07, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />

          {/* Floating stat 1 */}
          <div className="float-a" style={{ position: 'absolute', top: 60, left: -30, background: '#fff', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: 150, zIndex: 2 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#E1F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 5L6.5 11.5 3 8" stroke="#0F6E56" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1, color: '#1A1A1A' }}>1,240</div>
              <div style={{ fontSize: 11, color: '#6B6560', marginTop: 2 }}>meals rescued</div>
            </div>
          </div>

          {/* Hero card */}
          <div style={{ position: 'relative', background: '#C8473A', borderRadius: 28, width: 280, height: 380, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28, zIndex: 1 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(135deg,transparent,transparent 20px,rgba(255,255,255,0.04) 20px,rgba(255,255,255,0.04) 21px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: 'serif', fontSize: 42, color: 'rgba(255,255,255,0.18)', lineHeight: 1, letterSpacing: 2, textAlign: 'right' }}>救<br />食</div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="200" height="220" viewBox="0 0 200 220" fill="none">
                <line x1="60" y1="20" x2="108" y2="148" stroke="#D4A96A" strokeWidth="6" strokeLinecap="round" />
                <line x1="140" y1="20" x2="92" y2="148" stroke="#C49558" strokeWidth="6" strokeLinecap="round" />
                <path d="M60 20 Q100 0 140 20" stroke="#B07D40" strokeWidth="5" strokeLinecap="round" fill="none" />
                <rect x="52" y="12" width="16" height="28" rx="6" fill="#C49558" />
                <rect x="132" y="12" width="16" height="28" rx="6" fill="#C49558" />
                <path d="M108 148 L96 170 L100 172 L114 150 Z" fill="#C49558" />
                <path d="M92 148 L104 170 L100 172 L86 150 Z" fill="#B07D40" />
                <ellipse cx="100" cy="178" rx="46" ry="22" fill="#E8C070" />
                <path d="M54 178 Q30 155 42 138 Q54 122 66 145 Q72 160 54 178 Z" fill="#DBA94A" />
                <path d="M146 178 Q170 155 158 138 Q146 122 134 145 Q128 160 146 178 Z" fill="#DBA94A" />
                <ellipse cx="100" cy="174" rx="34" ry="16" fill="#F0CC7A" />
                <path d="M70 178 Q100 168 130 178" stroke="#C9922A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.7" />
                <path d="M74 184 Q100 174 126 184" stroke="#C9922A" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
                <ellipse cx="100" cy="200" rx="44" ry="8" fill="rgba(0,0,0,0.15)" />
                <ellipse cx="88" cy="168" rx="12" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-20 88 168)" />
              </svg>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 6, fontWeight: 500 }}>Today's rescue</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 14 }}>Fresh pastries<br />available now</div>
              <button onClick={() => navigate('/login/claimant')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: '#A33328', fontSize: 12, fontWeight: 500, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Claim now
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>

          {/* Floating stat 2 */}
          <div className="float-b" style={{ position: 'absolute', bottom: 80, right: -30, background: '#fff', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', minWidth: 150, zIndex: 2 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FAECE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M3 7l5-5 5 5" stroke="#993C1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 500, lineHeight: 1, color: '#1A1A1A' }}>98%</div>
              <div style={{ fontSize: 11, color: '#6B6560', marginTop: 2 }}>collection rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FEATURES STRIP ── */}
      <div style={{ background: '#1A1A1A', padding: '28px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          {[
            { color: '#1D9E75', label: 'Zero food waste', sub: 'Surplus redistributed daily' },
            { color: '#C8473A', label: '60-min collection', sub: 'Fast, coordinated pickups' },
            { color: '#E8C070', label: 'Verified vendors', sub: 'Quality checked listings' },
            { color: '#85B7EB', label: 'Secure platform', sub: 'Trusted by 40+ orgs in SG' },
          ].map(({ color, label, sub }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>{sub}</div>
              </div>
              {i < 3 && <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)', marginLeft: 20 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
