// ── Date helpers ─────────────────────────────────────────────────────────────
const SGT = 'Asia/Singapore'

export const fmtTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-SG', {
    timeZone: SGT,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Convert a UTC date to a datetime-local string in SGT (for <input type="datetime-local">)
export const toSgtLocalDt = (date) => {
  const d = new Date(date)
  // Format as YYYY-MM-DDTHH:MM in SGT
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SGT,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d)
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
}

export const minutesAgo = (d) => (Date.now() - new Date(d).getTime()) / 60_000

export const minutesUntil = (d) => (new Date(d).getTime() - Date.now()) / 60_000

// ── Status badge helper ───────────────────────────────────────────────────────
export const statusBadgeClass = (status) => {
  const map = {
    Available: 'badge-available',
    Reserved: 'badge-reserved',
    Collected: 'badge-collected',
    Cancelled: 'badge-cancelled',
    Expired: 'badge-expired',
  }
  return map[status] ?? ''
}

// ── Categories ────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  'Bread & pastries',
  'Fruits & vegetables',
  'Cooked meals',
  'Dairy & eggs',
  'Beverages',
]
