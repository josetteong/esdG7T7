import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { SEED_LISTINGS } from '../data/seed'

const AppContext = createContext(null)

const makeClaimantState = () => ({
  strikes: 0,
  suspended: false,
  suspendedUntil: null,
  collected: 0,
  feesPaid: 0,
})

export function AppProvider({ children }) {
  const nextId = useRef(10)
  const newId = () => ++nextId.current

  const [listings, setListings] = useState(SEED_LISTINGS)
  const [reservations, setReservations] = useState([])
  const [claimants, setClaimants] = useState({})

  const getClaimantState = useCallback(
    (email) => claimants[email] ?? makeClaimantState(),
    [claimants]
  )

  const updateClaimantState = useCallback((email, updater) => {
    setClaimants((prev) => ({
      ...prev,
      [email]: updater(prev[email] ?? makeClaimantState()),
    }))
  }, [])

  // ── Vendor ────────────────────────────────────────────────────────────────
  const postListing = useCallback(
    (fields, vendorEmail, vendorName) => {
      const listing = {
        id: newId(),
        ...fields,
        qtyRemaining: fields.qty,
        status: 'Available',
        vendorEmail,
        vendorName,
        createdAt: new Date().toISOString(),
      }
      setListings((prev) => [listing, ...prev])
      return listing
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const cancelListing = useCallback((listingId) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, status: 'Cancelled' } : l))
    )
    setReservations((prev) =>
      prev.map((r) =>
        r.listingId === listingId && r.status === 'Reserved'
          ? { ...r, status: 'Cancelled' }
          : r
      )
    )
  }, [])

  // ── Claimant ──────────────────────────────────────────────────────────────
  const claimListing = useCallback(
    (listing, qty, claimantEmail, bypassedSuspension = false) => {
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== listing.id) return l
          const newRemaining = l.qtyRemaining - qty
          return { ...l, qtyRemaining: newRemaining, status: newRemaining === 0 ? 'Reserved' : l.status }
        })
      )
      const deadline = new Date(Date.now() + listing.collectWindowMins * 60_000)
      const reservation = {
        id: newId(),
        listingId: listing.id,
        desc: listing.desc,
        cat: listing.cat,
        qty,
        collectWindowMins: listing.collectWindowMins,
        collectDeadline: deadline.toISOString(),
        status: 'Reserved',
        reservedAt: new Date().toISOString(),
        claimantEmail,
        bypassedSuspension,
      }
      setReservations((prev) => [reservation, ...prev])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const collectReservation = useCallback(
    (res, claimantEmail) => {
      setReservations((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: 'Completed' } : r))
      )
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== res.listingId) return l
          if (l.qtyRemaining === 0 && !['Cancelled', 'Expired'].includes(l.status))
            return { ...l, status: 'Collected' }
          return l
        })
      )
      updateClaimantState(claimantEmail, (cs) => ({ ...cs, collected: cs.collected + 1 }))
    },
    [updateClaimantState]
  )

  const cancelReservation = useCallback(
    (res, claimantEmail, isLate) => {
      setReservations((prev) =>
        prev.map((r) => (r.id === res.id ? { ...r, status: 'Cancelled' } : r))
      )
      setListings((prev) =>
        prev.map((l) => {
          if (l.id !== res.listingId) return l
          const newRemaining = l.qtyRemaining + res.qty
          return {
            ...l,
            qtyRemaining: newRemaining,
            status:
              ['Reserved', 'Collected'].includes(l.status) && newRemaining > 0
                ? 'Available'
                : l.status,
          }
        })
      )
      if (isLate) {
        updateClaimantState(claimantEmail, (cs) => {
          const newStrikes = cs.strikes + 1
          if (newStrikes >= 5) {
            return {
              ...cs,
              strikes: newStrikes,
              suspended: true,
              suspendedUntil: new Date(Date.now() + 90 * 24 * 3_600_000).toISOString(),
            }
          }
          return { ...cs, strikes: newStrikes }
        })
      }
    },
    [updateClaimantState]
  )

  const expireReservation = useCallback((res) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === res.id ? { ...r, status: 'Cancelled', expiredByWindow: true } : r
      )
    )
    setListings((prev) =>
      prev.map((l) => {
        if (l.id !== res.listingId) return l
        const newRemaining = l.qtyRemaining + res.qty
        return {
          ...l,
          qtyRemaining: newRemaining,
          status: l.status === 'Reserved' && newRemaining > 0 ? 'Available' : l.status,
        }
      })
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        listings,
        reservations,
        getClaimantState,
        postListing,
        cancelListing,
        claimListing,
        collectReservation,
        cancelReservation,
        expireReservation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
