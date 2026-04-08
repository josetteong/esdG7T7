import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../shared/Toast'
import { CATEGORIES } from '../shared/utils'

export default function PostListingForm() {
  const { postListing } = useApp()
  const { user } = useAuth()
  const toast = useToast()

  const [form, setForm] = useState({ desc: '', qty: '', cat: '', expiry: '', collectWindowMins: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    if (!form.desc || !form.qty || !form.cat || !form.expiry || !form.collectWindowMins) {
      toast('Missing fields', 'Please fill in all required fields.', 'warning')
      setSubmitting(false)
      return
    }
    try {
      await postListing(
        { ...form, qty: parseInt(form.qty, 10), collectWindowMins: parseInt(form.collectWindowMins, 10) },
        user.id
      )
      toast('Listing posted', `"${form.desc}" is live. Collect within ${form.collectWindowMins} min.`)
      setForm({ desc: '', qty: '', cat: '', expiry: '', collectWindowMins: '', notes: '' })
    } catch (err) {
      toast('Unable to post listing', err.message || 'Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const labelStyle = { display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: 5 }
  const inputStyle = { width: '100%', fontSize: 13, padding: '9px 12px', border: '0.5px solid rgba(0,0,0,0.14)', borderRadius: 9, background: '#F5F3EF', color: '#1A1A1A', fontFamily: 'inherit', outline: 'none' }

  return (
    <div className="card">
      <div className="card-hd">
        <div className="card-hd-dot" />
        <span className="card-hd-title">Post new listing</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Food description</label>
          <input className="form-input" placeholder="e.g. Assorted croissants (12 pcs)" value={form.desc} onChange={set('desc')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Quantity</label>
            <input type="number" min="1" className="form-input" placeholder="12" value={form.qty} onChange={set('qty')} />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select className="form-input" value={form.cat} onChange={set('cat')} style={inputStyle}>
              <option value="">Select…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Expiry time</label>
          <input type="datetime-local" className="form-input" value={form.expiry} onChange={set('expiry')} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Collection window</label>
          <select className="form-input" value={form.collectWindowMins} onChange={set('collectWindowMins')} style={inputStyle}>
            <option value="">Select…</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>60 min (max)</option>
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea className="form-input" style={{ ...inputStyle, resize: 'none', height: 60, lineHeight: 1.5 }} placeholder="Allergens, storage instructions…" value={form.notes} onChange={set('notes')} />
        </div>

        {/* Info strip */}
        <div style={{ background: '#E1F5EE', border: '0.5px solid #9FE1CB', borderRadius: 8, padding: '10px 12px', fontSize: 11, color: '#085041', display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="7" cy="7" r="6" stroke="#0F6E56" strokeWidth="1.2" />
            <path d="M7 6v4M7 4.5v.4" stroke="#0F6E56" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>Claimants must collect within the window after reserving. Uncollected slots auto-release (max 60 min).</span>
        </div>

        <button type="submit" disabled={submitting} aria-disabled={submitting} style={{ width: '100%', background: submitting ? '#D9A19C' : '#C8473A', color: '#fff', border: 'none', borderRadius: 10, padding: '11px', fontSize: 13, fontWeight: 500, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="white" strokeWidth="1.6" strokeLinecap="round" /></svg>
          {submitting ? 'Posting…' : 'Post listing'}
        </button>
      </form>
    </div>
  )
}
