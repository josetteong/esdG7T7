const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.detail || data?.error || data?.message || 'Something went wrong.',
    }
  }
  return data
}

export const registerClaimant = (claimant_name, email, password) =>
  apiFetch('/registrations/claimant', {
    method: 'POST',
    body: JSON.stringify({ claimant_name, email, password }),
  })

export const registerVendor = (vendor_name, contact_email, password) =>
  apiFetch('/registrations/vendor', {
    method: 'POST',
    body: JSON.stringify({ vendor_name, contact_email, password }),
  })

export const loginClaimant = (email, password) =>
  apiFetch('/claimants/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const loginVendor = (email, password) =>
  apiFetch('/vendors/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const getListings = () => apiFetch('/listings')

export const createListing = (payload) =>
  apiFetch('/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getReservations = () => apiFetch('/reservations')

export const reserveComposite = (payload) =>
  apiFetch('/reserve', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const collectReservationApi = (payload) =>
  apiFetch('/collect', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const cancelClaimantReservation = (payload) =>
  apiFetch('/claimant/cancel', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const cancelVendorListing = (payload) =>
  apiFetch('/vendor/cancel', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

export const reconnectTelegram = (userId, role) =>
  apiFetch(`/registrations/${userId}/${role.toUpperCase()}/reconnect`, { method: 'POST' })

export const getVendor = (vendorId) => apiFetch(`/vendors/${vendorId}`)

export const getStrikeCount = (claimantId) => apiFetch(`/strikes/${claimantId}`)

export const getClaimantEligibility = (claimantId) =>
  apiFetch(`/strikes/${claimantId}/eligibility`)
