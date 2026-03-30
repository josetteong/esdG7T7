// ── Date helpers ─────────────────────────────────────────────────────────────
export const fmtTime = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-SG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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
