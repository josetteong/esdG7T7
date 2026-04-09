import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import PostListingForm from './PostListingForm'
import VendorListings from './VendorListings'

export default function VendorPage() {
  const { listings, reservations } = useApp()
  const { user } = useAuth()
  const mine = listings.filter((l) => String(l.vendorId) === String(user.id))
  const mineIds = new Set(mine.map((l) => l.id))
  const active = mine.filter((l) => l.status === 'Available').length
  const collected = reservations.filter((r) => mineIds.has(r.listingId) && r.status === 'Completed').length
  const cancelled = mine.filter((l) => ['Cancelled', 'Expired'].includes(l.status)).length

  const today = new Date().toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>Vendor Dashboard</h1>
          <p style={{ fontSize: 13, color: '#6B6560', marginTop: 3, fontWeight: 300 }}>Manage your surplus food listings and monitor collections</p>
        </div>
        <span style={{ fontSize: 11, color: '#6B6560', background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)', padding: '5px 12px', borderRadius: 20 }}>{today}</span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
        {[
          {
            cls: 'green', icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2.5" stroke="#0F6E56" strokeWidth="1.5" /><path d="M6 5V4a4 4 0 018 0v1" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" /><path d="M7 11h6M7 14h4" stroke="#0F6E56" strokeWidth="1.4" strokeLinecap="round" /></svg>
            ), iconCls: 'mi-green', num: active, lbl: 'Active listings', trend: `${active} available`
          },
          {
            cls: 'blue', icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3L12.5 8.5H18L13.5 12l2 6.5L10 15l-5.5 3.5 2-6.5L2 8.5h5.5z" stroke="#185FA5" strokeWidth="1.5" strokeLinejoin="round" /></svg>
            ), iconCls: 'mi-blue', num: collected, lbl: 'Collected today', trend: `${collected} pickups`
          },
          {
            cls: 'amber', icon: (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="#BA7517" strokeWidth="1.5" /><path d="M10 6v4.5l3 2" stroke="#BA7517" strokeWidth="1.5" strokeLinecap="round" /></svg>
            ), iconCls: 'mi-amber', num: cancelled, lbl: 'Cancelled / expired', trend: cancelled === 0 ? 'none today' : `${cancelled} released`
          },
        ].map(({ cls, icon, iconCls, num, lbl, trend }) => (
          <div key={lbl} className={`metric-card ${cls}`}>
            <div className={`metric-icon ${iconCls}`}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 500, lineHeight: 1, color: '#1A1A1A' }}>{num}</div>
              <div style={{ fontSize: 12, color: '#6B6560', marginTop: 3 }}>{lbl}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: cls === 'green' ? '#E1F5EE' : cls === 'blue' ? '#E6F1FB' : '#F1EFE8', color: cls === 'green' ? '#085041' : cls === 'blue' ? '#0C447C' : '#5F5E5A' }}>{trend}</span>
          </div>
        ))}
      </div>

      {/* Two-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 16 }}>
        <PostListingForm />
        <VendorListings />
      </div>
    </div>
  )
}
