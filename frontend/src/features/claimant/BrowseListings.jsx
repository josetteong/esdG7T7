import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../shared/Toast'
import Modal from '../shared/Modal'
import { fmtTime } from '../shared/utils'

export default function BrowseListings({ claimantState }) {
  const { listings, claimListing } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [qtys, setQtys] = useState({})
  const [feeTarget, setFeeTarget] = useState(null)

  const q = search.toLowerCase()
  const available = listings.filter((l) =>
    l.status === 'Available' && l.qtyRemaining > 0 &&
    (!q || l.desc.toLowerCase().includes(q) || l.cat.toLowerCase().includes(q))
  )

  const getQty = (l) => parseInt(qtys[l.id] ?? 1)
  const expiresUrgent = (l) => {
    const mins = (new Date(l.expiry) - Date.now()) / 60000
    return mins < 60
  }

  const attemptClaim = (listing) => {
    if (claimantState.suspended) { setFeeTarget(listing); return }
    doClaim(listing, false)
  }

  const doClaim = (listing, bypassed) => {
    const qty = getQty(listing)
    if (!qty || qty < 1 || qty > listing.qtyRemaining) { toast('Invalid quantity', 'Please enter a valid quantity.', 'warning'); return }
    claimListing(listing, qty, user.email, bypassed)
    toast('Reserved!', `You reserved ${qty} × "${listing.desc}". Collect within ${listing.collectWindowMins} min.`)
    setQtys((p) => ({ ...p, [listing.id]: 1 }))
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75' }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>Available food</span>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search listings…"
          style={{ fontSize: 12, padding: '5px 10px', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: 7, background: '#fff', color: '#1A1A1A', fontFamily: 'inherit', outline: 'none', width: 140 }}
        />
      </div>

      {available.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#6B6560', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🌿</div>
          No food available right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {available.map((l) => {
            const urgent = expiresUrgent(l)
            return (
              <div key={l.id} className="listing-card" style={{ borderLeft: urgent ? '2px solid #C8473A' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{l.desc}</span>
                  <span className="badge badge-available">Available</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 8 }}>
                  <span className="meta-tag">{l.cat}</span>
                  <span className="meta-tag">by {l.vendorName}</span>
                  <span className="meta-tag">Expires {fmtTime(l.expiry)}</span>
                  <span className="meta-tag">{l.qtyRemaining} / {l.qty} remaining</span>
                  {l.notes && <span className="meta-tag" style={{ color: '#aaa' }}>{l.notes}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 500, color: urgent ? '#C8473A' : '#185FA5', marginBottom: 10 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M6 4v2.5l1.5 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  Must collect within {l.collectWindowMins} min{urgent ? ' — expires soon!' : ' of reserving'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
                  <span style={{ fontSize: 11, color: '#6B6560' }}>Qty:</span>
                  <input
                    type="number" min="1" max={l.qtyRemaining}
                    value={qtys[l.id] ?? 1}
                    onChange={(e) => setQtys((p) => ({ ...p, [l.id]: e.target.value }))}
                    style={{ width: 56, fontSize: 12, padding: '5px 8px', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 7, background: '#F5F3EF', textAlign: 'center', fontFamily: 'inherit', outline: 'none' }}
                  />
                  <span style={{ fontSize: 10, color: '#aaa' }}>max {l.qtyRemaining}</span>
                  <div style={{ marginLeft: 'auto' }}>
                    {claimantState.suspended
                      ? <button className="btn btn-amber btn-sm" onClick={() => attemptClaim(l)}>Reserve (pay $5)</button>
                      : <button className="btn btn-teal btn-sm" onClick={() => attemptClaim(l)}>Claim</button>
                    }
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* $5 bypass modal */}
      <Modal
        open={!!feeTarget}
        onClose={() => setFeeTarget(null)}
        title="Account suspended"
        footer={
          <>
            <button className="btn" onClick={() => setFeeTarget(null)}>Cancel</button>
            <button className="btn btn-amber" onClick={() => { setFeeTarget(null); doClaim(feeTarget, true) }}>Pay $5 and reserve</button>
          </>
        }
      >
        {feeTarget && (
          <div>
            <div className="banner banner-danger" style={{ marginBottom: 12 }}>
              <strong>Your account is suspended</strong> until {fmtTime(claimantState.suspendedUntil)} due to 5 late cancellations.
            </div>
            <p style={{ fontSize: 13, color: '#6B6560', lineHeight: 1.6 }}>You may bypass your suspension for this reservation by paying a one-time fee.</p>
            <div style={{ background: '#F5F3EF', border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 10, padding: 16, marginTop: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Bypass fee</p>
              <p style={{ fontSize: 22, fontWeight: 500, color: '#185FA5' }}>$5.00 SGD</p>
              <p style={{ fontSize: 12, color: '#6B6560', marginTop: 4, lineHeight: 1.5 }}>Allows one reservation while suspended. Suspension and strike count remain unchanged.</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
