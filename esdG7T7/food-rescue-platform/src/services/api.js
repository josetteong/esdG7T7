const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw { status: res.status, message: data.error || 'Something went wrong.' }
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
