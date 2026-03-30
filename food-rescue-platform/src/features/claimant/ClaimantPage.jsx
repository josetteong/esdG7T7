import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { fmtTime } from '../shared/utils'
import BrowseListings from './BrowseListings'
import MyReservations from './MyReservations'

export default function ClaimantPage() {
  const { reservations, getClaimantState } = useApp()
  const { user } = useAuth()
  const cs = getClaimantState(user.email)
  const myRes = reservations.filter((r) => r.claimantEmail === user.email)
  const activeCount = myRes.filter((r) => r.status === 'Reserved').length

  const today = new Date().toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>Claimant Portal</h1>
          <p style={{ fontSize: 13, color: '#6B6560', marginTop: 3, fontWeight: 300 }}>Browse available surplus food and manage your reservations</p>
        </div>
        <span style={{ fontSize: 11, color: '#6B6560', background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', padding: '5px 12px', borderRadius: 20 }}>{today}</span>
      </div>

      {/* Suspension banner */}
      {cs.suspended && (
        <div className="banner banner-danger" style={{ marginBottom: 20 }}>
          <strong>Account suspended</strong> until {fmtTime(cs.suspendedUntil)}. You have 5 late cancellations.
          You may still reserve food by paying a <strong>$5 bypass fee</strong> per reservation.
        </div>
      )}

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>

        {/* Active reservations */}
        <div className="metric-card green">
          <div className="metric-icon mi-green">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2.5" stroke="#0F6E56" strokeWidth="1.5" /><path d="M6 5V4a4 4 0 018 0v1" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" /><path d="M13 10l-4 4-2-2" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, color: '#1A1A1A' }}>{activeCount}</div>
            <div style={{ fontSize: 12, color: '#6B6560', marginTop: 3 }}>Active reservations</div>
          </div>
        </div>

        {/* Strikes */}
        <div className="metric-card clay" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#6B6560' }}>Strikes</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`strike-dot${i < cs.strikes ? ' filled' : ''}`} />
            ))}
            <span style={{ fontSize: 11, color: '#6B6560', marginLeft: 4 }}>{cs.strikes} / 5</span>
          </div>
          <div style={{ fontSize: 11, color: '#6B6560' }}>late cancellations</div>
        </div>

        {/* Total collected */}
        <div className="metric-card blue">
          <div className="metric-icon mi-blue">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3L12.5 8.5H18L13.5 12l2 6.5L10 15l-5.5 3.5 2-6.5L2 8.5h5.5z" stroke="#185FA5" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, color: '#1A1A1A' }}>{cs.collected}</div>
            <div style={{ fontSize: 12, color: '#6B6560', marginTop: 3 }}>Total collected</div>
          </div>
        </div>
      </div>

      {/* Two-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <BrowseListings claimantState={cs} />
        <MyReservations claimantState={cs} />
      </div>
    </div>
  )
}
