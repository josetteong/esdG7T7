import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const avatarBg = user.role === 'vendor' ? '#C8473A' : '#185FA5'
  const isClaimant = user.role === 'claimant'

  return (
    <nav style={{
      background: '#A33328',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Stripe texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg,transparent,transparent 14px,rgba(255,255,255,0.025) 14px,rgba(255,255,255,0.026) 15px)', pointerEvents: 'none' }} />

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, zIndex: 1 }}>
        <div style={{ width: 30, height: 30, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.5 2 3 4 3 7c0 2 1.5 4 5 6 3.5-2 5-4 5-6 0-3-2.5-5-5-5z" fill="white" />
          </svg>
        </div>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: '#fff', letterSpacing: '-0.01em' }}>
          Food<span style={{ color: '#9FE1CB' }}>Rescue</span>
        </span>
      </div>

      {/* Divider + role pill */}
      <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.15)', margin: '0 16px', zIndex: 1 }} />
      <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9FE1CB', background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', padding: '3px 10px', borderRadius: 20, zIndex: 1 }}>
        {user.role}
      </span>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>

        {/* Telegram connected badge — claimants only */}
        {isClaimant && user.telegramHandle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,158,217,0.15)', border: '1px solid rgba(34,158,217,0.3)', padding: '3px 10px', borderRadius: 20 }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <circle cx="5.5" cy="5.5" r="4.5" fill="rgba(34,158,217,0.3)" />
              <path d="M9 2.5L2 5.5l2.5 1 1 2.5 1.5-2 2.5 1.5L9 2.5z" fill="#82CFED" />
            </svg>
            <span style={{ fontSize: 10, color: '#82CFED', fontWeight: 500 }}>@{user.telegramHandle}</span>
          </div>
        )}

        {/* Telegram not connected nudge — claimants only */}
        {isClaimant && !user.telegramHandle && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF9F27' }} />
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Telegram not connected</span>
          </div>
        )}

        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{user.name}</span>

        <div style={{ width: 28, height: 28, borderRadius: '50%', background: avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: '#fff', flexShrink: 0, border: '2px solid rgba(255,255,255,0.2)' }}>
          {initials}
        </div>

        <button
          onClick={() => { logout(); navigate('/') }}
          style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '4px 11px', borderRadius: 6, cursor: 'pointer', background: 'none', fontFamily: 'inherit', transition: 'all 0.15s' }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
