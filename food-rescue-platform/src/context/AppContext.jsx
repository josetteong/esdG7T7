import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import {
  getListings,
  getReservations,
  createListing,
  reserveComposite,
  collectReservationApi,
  cancelClaimantReservation,
  cancelVendorListing,
  getStrikeCount,
  getClaimantEligibility,
} from '../services/api'

const AppContext = createContext(null)

const makeClaimantState = () => ({
  strikes: 0,
  suspended: false,
  suspendedUntil: null,
  collected: 0,
  feesPaid: 0,
})

const listingStatusToUi = {
  AVAILABLE: 'Available',
  FULLY_RESERVED: 'Reserved',
  COLLECTED: 'Collected',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
}

const reservationStatusToUi = {
  RESERVED: 'Reserved',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Cancelled',
  MISSED_PICKUP: 'Cancelled',
}

const toUiListing = (l) => ({
  id: Number(l.id),
  vendorId: String(l.vendor_id),
  desc: l.food_name,
  cat: 'General',
  qty: l.total_quantity,
  qtyRemaining: l.remaining_qty,
  expiry: l.expiry_time,
  status: listingStatusToUi[l.status] ?? 'Available',
  notes: '',
  collectWindowMins: 60,
  createdAt: l.created_at,
  vendorName: `Vendor #${l.vendor_id}`,
})

const toUiReservation = (r, listingMap) => {
  const listing = listingMap.get(Number(r.listing_id))
  const reservedAt = r.created_at
  const pickup = r.pickup_time
  const computedWindow = Math.max(
    1,
    Math.round((new Date(pickup).getTime() - new Date(reservedAt).getTime()) / 60000)
  )
  return {
    id: Number(r.id),
    listingId: Number(r.listing_id),
    claimantId: String(r.claimant_id),
    qty: r.reservation_qty,
    collectWindowMins: Number.isFinite(computedWindow) ? computedWindow : 60,
    collectDeadline: pickup,
    status: reservationStatusToUi[r.status] ?? 'Reserved',
    reservedAt,
    desc: listing?.desc ?? `Listing #${r.listing_id}`,
    cat: listing?.cat ?? 'General',
    bypassedSuspension: false,
    expiredByWindow: r.status === 'MISSED_PICKUP' || r.status === 'EXPIRED',
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [reservations, setReservations] = useState([])
  const [claimantState, setClaimantState] = useState(makeClaimantState())
  const [loading, setLoading] = useState(false)

  const refreshData = useCallback(async () => {
    if (!user) {
      setListings([])
      setReservations([])
      setClaimantState(makeClaimantState())
      return
    }

    setLoading(true)
    try {
      const [listingRows, reservationRows] = await Promise.all([getListings(), getReservations()])
      const mappedListings = listingRows.map(toUiListing)
      const listingMap = new Map(mappedListings.map((l) => [l.id, l]))
      const mappedReservations = reservationRows.map((r) => toUiReservation(r, listingMap))

      setListings(mappedListings)
      setReservations(mappedReservations)

      if (user.role === 'claimant') {
        const [strike, eligibility] = await Promise.all([
          getStrikeCount(user.id),
          getClaimantEligibility(user.id),
        ])
        const collected = mappedReservations.filter(
          (r) => r.claimantId === String(user.id) && r.status === 'Completed'
        ).length
        setClaimantState({
          strikes: strike.count ?? 0,
          suspended: !eligibility.eligible,
          suspendedUntil: null,
          collected,
          feesPaid: 0,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  useEffect(() => {
    if (!user) return undefined
    const intervalId = setInterval(refreshData, 15000)
    return () => clearInterval(intervalId)
  }, [user, refreshData])

  const getClaimantState = useCallback(
    () => claimantState,
    [claimantState]
  )

  // ── Vendor ────────────────────────────────────────────────────────────────
  const postListing = useCallback(
    async (fields, vendorId) => {
      await createListing({
        vendor_id: Number(vendorId),
        food_name: fields.desc,
        total_quantity: Number(fields.qty),
        expiry_time: new Date(fields.expiry).toISOString(),
      })
      await refreshData()
    },
    [refreshData]
  )

  const cancelListing = useCallback(async (listingId, vendorId) => {
    await cancelVendorListing({ listing_id: Number(listingId), vendor_id: Number(vendorId) })
    await refreshData()
  }, [refreshData])

  // ── Claimant ──────────────────────────────────────────────────────────────
  const claimListing = useCallback(
    async (listing, qty, claimantId) => {
      const pickupTime = new Date(Date.now() + listing.collectWindowMins * 60_000).toISOString()
      await reserveComposite({
        claimant_id: Number(claimantId),
        listing_id: Number(listing.id),
        reservation_qty: Number(qty),
        pickup_time: pickupTime,
      })
      await refreshData()
    },
    [refreshData]
  )

  const collectReservation = useCallback(
    async (res, claimantId) => {
      await collectReservationApi({
        reservation_id: Number(res.id),
        claimant_id: Number(claimantId),
      })
      await refreshData()
    },
    [refreshData]
  )

  const cancelReservation = useCallback(
    async (res, claimantId) => {
      await cancelClaimantReservation({
        reservation_id: Number(res.id),
        claimant_id: Number(claimantId),
      })
      await refreshData()
    },
    [refreshData]
  )

  const expireReservation = useCallback(async () => {
    await refreshData()
  }, [refreshData])

  return (
    <AppContext.Provider
      value={{
        listings,
        reservations,
        loading,
        refreshData,
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
