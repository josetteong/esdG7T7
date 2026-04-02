import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../shared/Toast'
import Modal from '../shared/Modal'
import { fmtTime, minutesAgo } from '../shared/utils'

export default function MyReservations({ claimantState }) {
  const { reservations, collectReservation, cancelReservation, expireReservation } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [cancelTarget, setCancelTarget] = useState(null)

  const myRes = reservations.filter((r) => String(r.claimantId) === String(user.id))
  const minsLeft = (r) => Math.max(0, r.collectWindowMins - minutesAgo(r.reservedAt))
  const graceMinsLeft = (r) => Math.max(0, 10 - minutesAgo(r.reservedAt))
  const windowPct = (r) => Math.round((minsLeft(r) / r.collectWindowMins) * 100)
  const barColor = (r) => { const p = windowPct(r); return p > 50 ? '#1D9E75' : p > 20 ? '#EF9F27' : '#C8473A' }

  const handleCollect = async (res) => {
    if (minutesAgo(res.reservedAt) >= res.collectWindowMins) {
      toast('Window expired', 'The collection window has passed. This reservation has been released.', 'error')
      await expireReservation(res)
      return
    }
    try {
      await collectReservation(res, user.id)
      toast('Collected!', `${res.qty} × "${res.desc}" confirmed. Thank you!`)
    } catch (err) {
      toast('Collection failed', err.message || 'Please try again.', 'error')
    }
  }

  const confirmCancel = async () => {
    const isLate = minutesAgo(cancelTarget.reservedAt) >= 10
    try {
      await cancelReservation(cancelTarget, user.id)
      if (isLate) toast('Cancellation submitted', 'Late cancellation may add a strike.', 'warning')
      else toast('Cancelled', 'Cancelled within grace period — no penalty.')
      setCancelTarget(null)
    } catch (err) {
      toast('Cancellation failed', err.message || 'Please try again.', 'error')
    }
  }

  const isLateCancel = cancelTarget ? minutesAgo(cancelTarget.reservedAt) >= 10 : false

  const badgeCls = (r) => {
    if (r.expiredByWindow) return 'badge-expired'
    return { Reserved: 'badge-reserved', Completed: 'badge-completed', Cancelled: 'badge-cancelled' }[r.status] ?? ''
  }

  const activeCount = myRes.filter((r) => r.status === 'Reserved').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8473A' }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>My reservations</span>
        </div>
        {activeCount > 0 && <span style={{ fontSize: 11, color: '#6B6560' }}>{activeCount} active</span>}
      </div>

      {myRes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B6560', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🗂️</div>
          No reservations yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myRes.map((r) => {
            const isActive = r.status === 'Reserved'
            const pct = windowPct(r)
            const color = barColor(r)
            const grace = graceMinsLeft(r)
            return (
              <div key={r.id} className="listing-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.qty} × {r.desc}</span>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {r.bypassedSuspension && <span className="badge" style={{ background: '#FAEEDA', color: '#854F0B', fontSize: 10 }}>$5 paid</span>}
                    <span className={`badge ${badgeCls(r)}`}>{r.expiredByWindow ? 'Window expired' : r.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: isActive ? 10 : 0 }}>
                  <span className="meta-tag">{r.cat}</span>
                  <span className="meta-tag">Reserved {fmtTime(r.reservedAt)}</span>
                  {isActive && <span className="meta-tag">Collect by <strong>{fmtTime(r.collectDeadline)}</strong></span>}
                  {r.expiredByWindow && <span style={{ fontSize: 11, color: '#C8473A' }}>Not collected in time — released back</span>}
                  {r.status === 'Completed' && <span style={{ fontSize: 11, color: '#1D9E75', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 6l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Successfully collected</span>}
                </div>

                {/* Progress bar + grace note */}
                {isActive && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B6560', marginBottom: 4 }}>
                      <span>Collection window</span>
                      <span style={{ color, fontWeight: 500 }}>{minsLeft(r).toFixed(1)} min left</span>
                    </div>
                    <div className="prog-wrap">
                      <div className="prog-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <p style={{ fontSize: 10, color: grace > 0 ? '#6B6560' : '#C8473A', marginTop: 5 }}>
                      Grace period (cancel without penalty):{' '}
                      {grace > 0 ? `${grace.toFixed(1)} min remaining` : 'expired — late cancel incurs a strike'}
                    </p>
                  </div>
                )}

                {isActive && (
                  <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                    <button className="btn btn-success btn-sm" onClick={() => handleCollect(r)}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 6l3 3 4-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Confirm collection
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(r)}>Cancel</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel reservation"
        footer={
          <>
            <button className="btn" onClick={() => setCancelTarget(null)}>Keep reservation</button>
            <button className="btn btn-danger" onClick={confirmCancel}>Yes, cancel</button>
          </>
        }
      >
        {cancelTarget && (
          <div>
            <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.7 }}>
              You are about to cancel your reservation for <strong>{cancelTarget.qty} × {cancelTarget.desc}</strong>.
            </p>
            {isLateCancel ? (
              <div className="banner banner-warning" style={{ marginTop: 12 }}>
                <strong>Late cancellation.</strong> More than 10 minutes have passed. This will add 1 strike.
                {claimantState.strikes + 1 >= 5 && (
                  <span style={{ display: 'block', marginTop: 8, color: '#712B13', fontWeight: 500 }}>
                    Warning: This will be your 5th strike — your account will be suspended for 90 days.
                  </span>
                )}
                {claimantState.strikes + 1 < 5 && <span> (Current: {claimantState.strikes} / 5 strikes)</span>}
              </div>
            ) : (
              <div className="banner banner-success" style={{ marginTop: 12 }}>Within the 10-minute grace period — no penalty will be applied.</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
