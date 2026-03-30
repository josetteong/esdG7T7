import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'


// Role-specific notification list
const NOTIFICATIONS = {
  vendor: [
    { icon: '✅', text: 'Reservation notifications' },
    { icon: '🎉', text: 'Collection success alerts' },
    { icon: '📋', text: 'Posting listing success' },
    { icon: '❌', text: 'Listing cancellation alerts' },
  ],
  claimant: [
    { icon: '✅', text: 'Reservation confirmed' },
    { icon: '❌', text: 'Cancellation & strike alerts' },
  ],
}

// Role-specific accent colour
const ACCENT = {
  vendor: { bg: '#FAECE7', icon: '#C8473A', btn: '#C8473A', btnHover: '#A33328', pill: '#E1F5EE', pillText: '#085041' },
  claimant: { bg: '#E1F5EE', icon: '#1D9E75', btn: '#1D9E75', btnHover: '#0F6E56', pill: '#E1F5EE', pillText: '#085041' },
}

export default function TelegramPrompt() {
  const { user, saveTelegramHandle, dismissTelegramPrompt } = useAuth()
  const [handle, setHandle] = useState('')
  const [step, setStep] = useState('form') // 'form' | 'deeplink'
  const [error, setError] = useState('')

  if (!user?.needsTelegramPrompt) return null

  const role = user.role
  const color = ACCENT[role] ?? ACCENT.claimant
  const notifications = NOTIFICATIONS[role] ?? NOTIFICATIONS.claimant
  const deepLink = user.telegramLink

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = handle.replace(/^@/, '').trim()
    if (!trimmed) { setError('Please enter your Telegram username.'); return }
    if (!/^[a-zA-Z0-9_]{4,32}$/.test(trimmed)) {
      setError('Username should be 4–32 characters: letters, numbers, underscores only.')
      return
    }
    saveTelegramHandle(trimmed)
    setStep('deeplink')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(26,26,26,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: 32,
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
      }}>

        {/* ── STEP 1: Enter username ── */}
        {step === 'form' && (
          <>
            {/* Icon */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M22.5 4L3 11.5l7 2.5 2.5 7 3.5-4.5 5 4L22.5 4z" stroke={color.icon} strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M10 14l2 6" stroke={color.icon} strokeWidth="1.6" strokeLinecap="round" />
                <path d="M10 14l5-3" stroke={color.icon} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8, letterSpacing: '-0.01em' }}>
              Stay notified on Telegram
            </h2>
            <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6, marginBottom: 20, fontWeight: 300 }}>
              {role === 'vendor'
                ? 'Connect your Telegram account to get real-time updates on your listings and reservations.'
                : 'Connect your Telegram account to receive instant updates on your reservations and collections.'
              }
            </p>

            {/* Notification list */}
            <div style={{ background: '#F5F3EF', borderRadius: 10, padding: '14px 16px', marginBottom: 24 }}>
              {notifications.map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#1A1A1A', marginBottom: 8 }}>
                  <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 6 }}>
                Your Telegram username
              </label>
              <div style={{ display: 'flex', alignItems: 'center', border: `0.5px solid rgba(0,0,0,0.14)`, borderRadius: 10, overflow: 'hidden', background: '#F5F3EF', marginBottom: error ? 6 : 16 }}>
                <span style={{ padding: '10px 12px', fontSize: 15, color: '#6B6560', background: 'rgba(0,0,0,0.04)', borderRight: '0.5px solid rgba(0,0,0,0.08)', userSelect: 'none', flexShrink: 0 }}>@</span>
                <input
                  type="text"
                  placeholder="your_username"
                  value={handle}
                  onChange={(e) => { setHandle(e.target.value); setError('') }}
                  style={{ flex: 1, fontSize: 14, padding: '10px 12px', border: 'none', background: 'transparent', color: '#1A1A1A', fontFamily: 'inherit', outline: 'none' }}
                  autoFocus
                />
              </div>
              {error && <p style={{ fontSize: 12, color: '#A32D2D', marginBottom: 12 }}>{error}</p>}

              <button
                type="submit"
                style={{ width: '100%', background: color.btn, color: '#fff', border: 'none', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Continue
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7h9M8.5 4l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>

            <button
              onClick={dismissTelegramPrompt}
              style={{ display: 'block', width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#bbb', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0' }}
            >
              Skip for now — I'll set this up later
            </button>
          </>
        )}

        {/* ── STEP 2: Deep link to bot ── */}
        {step === 'deeplink' && (
          <>
            {/* Icon */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <circle cx="13" cy="13" r="11" stroke="#229ED9" strokeWidth="1.6" />
                <path d="M19 7L7 13l5 2 1 5 3-3.5 4 2.5L19 7z" fill="#229ED9" />
              </svg>
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 8, letterSpacing: '-0.01em' }}>
              One last step
            </h2>
            <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6, marginBottom: 20, fontWeight: 300 }}>
              Tap the button below to open Telegram. Once there, press <strong>Start</strong> — that's it, you're connected!
            </p>

            {/* Username confirmed pill */}
            <div style={{ background: color.pill, border: `0.5px solid #9FE1CB`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: color.btn, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 5L6.5 11.5 3 8" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div>
                <p style={{ fontSize: 12, color: color.pillText, fontWeight: 500 }}>@{user.telegramHandle}</p>
                <p style={{ fontSize: 11, color: '#6B6560', marginTop: 2 }}>Click below to activate notifications</p>
              </div>
            </div>

            {/* Numbered steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                'Click "Open in Telegram" below',
                'Press the Start button in the bot chat',
                'Come back here — you\'re all set!',
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: '#185FA5', flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: '#1A1A1A' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* THE deep link button */}
            <a
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                width: '100%', background: '#229ED9', color: '#fff',
                borderRadius: 10, padding: 13, fontSize: 14, fontWeight: 500,
                textDecoration: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="8" fill="rgba(255,255,255,0.2)" />
                <path d="M15 4L2 9l4.5 1.5 1.5 4.5 2.5-3 3.5 2.5L15 4z" fill="white" />
              </svg>
              Open in Telegram
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>

            <button
              onClick={dismissTelegramPrompt}
              style={{ display: 'block', width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#bbb', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0' }}
            >
              I've already pressed Start — done!
            </button>
          </>
        )}
      </div>
    </div>
  )
}
