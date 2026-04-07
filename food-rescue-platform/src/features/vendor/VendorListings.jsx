import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../shared/Toast'
import Modal from '../shared/Modal'
import { fmtTime, statusBadgeClass } from '../shared/utils'

const STATUS_OPTIONS = ['all', 'Available', 'Reserved', ' ed', 'Cancelled', 'Expired']

export default function VendorListings() {
  const { listings, reservations, cancelListing } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const [cancelTarget, setCancelTarget] = useState(null)

  const myListings = listings.filter((l) => String(l.vendorId) === String(user.id))
  const visible = filter === 'all' ? myListings : myListings.filter((l) => l.status === filter)
  const affectedCount = (id) => reservations.filter((r) => r.listingId === id && r.status === 'Reserved').length

  const confirmCancel = async () => {
    try {
      await cancelListing(cancelTarget.id, user.id)
      toast('Listing cancelled', `"${cancelTarget.desc}" cancelled.`, 'warning')
      if (affectedCount(cancelTarget.id) > 0)
        toast('Reservations cancelled', `${affectedCount(cancelTarget.id)} claimant(s) notified.`, 'warning')
      setCancelTarget(null)
    } catch (err) {
      toast('Unable to cancel listing', err.message || 'Please try again.', 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#C8473A' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>My listings</span>
        </div>
        <select
          className="section-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s}</option>)}
        </select>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B6560', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📦</div>
          No listings found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map((l) => {
            const canCancel = ['Available', 'Reserved'].includes(l.status)
            return (
              <div key={l.id} className="listing-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{l.desc}</span>
                  <span className={`badge ${statusBadgeClass(l.status)}`}>{l.status}</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 10 }}>
                  <span className="meta-tag">{l.cat}</span>
                  <span className="meta-tag">Window: {l.collectWindowMins} min</span>
                  <span className="meta-tag">Qty: {l.qtyRemaining} / {l.qty} remaining</span>
                  {l.notes && <span className="meta-tag" style={{ color: '#aaa' }}>{l.notes}</span>}
                </div>

                <div className="listing-footer">
                  <span style={{ fontSize: 11, color: '#6B6560' }}>Expires {fmtTime(l.expiry)}</span>
                  {canCancel && (
                    <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(l)}>
                      Cancel listing
                    </button>
                  )}
                  {l.status === 'Collected' && (
                    <span style={{ fontSize: 11, color: '#1D9E75', fontWeight: 500 }}>Successfully collected</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel listing"
        footer={
          <>
            <button className="btn" onClick={() => setCancelTarget(null)}>Keep listing</button>
            <button className="btn btn-danger" onClick={confirmCancel}>Confirm cancellation</button>
          </>
        }
      >
        {cancelTarget && (
          <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6 }}>
            Are you sure you want to cancel <strong>{cancelTarget.desc}</strong>?
            {affectedCount(cancelTarget.id) > 0 && (
              <span style={{ display: 'block', marginTop: 12, color: '#712B13' }}>
                {affectedCount(cancelTarget.id)} active reservation(s) will be cancelled and claimants notified.
              </span>
            )}
          </p>
        )}
      </Modal>
    </div>
  )
}
