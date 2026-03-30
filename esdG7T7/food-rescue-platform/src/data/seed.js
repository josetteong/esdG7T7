// Seed data for demo. Remove and fetch from API instead when building the backend.
const future = (h) => new Date(Date.now() + h * 3_600_000).toISOString().slice(0, 16)

export const SEED_LISTINGS = [
  { id: 1, desc: 'Whole wheat bread loaves', qty: 12, qtyRemaining: 12, cat: 'Bread & pastries', expiry: future(4), collectWindowMins: 60, notes: 'Vegan-friendly', status: 'Available', vendorEmail: 'bakery@example.com', vendorName: 'Sunshine Bakery', createdAt: new Date().toISOString() },
  { id: 2, desc: 'Mixed fruit box', qty: 20, qtyRemaining: 15, cat: 'Fruits & vegetables', expiry: future(6), collectWindowMins: 45, notes: '', status: 'Available', vendorEmail: 'supermart@example.com', vendorName: 'SuperMart SG', createdAt: new Date().toISOString() },
  { id: 3, desc: 'Cooked chicken rice portions', qty: 10, qtyRemaining: 10, cat: 'Cooked meals', expiry: future(2), collectWindowMins: 30, notes: 'Contains sesame oil', status: 'Available', vendorEmail: 'bakery@example.com', vendorName: 'Sunshine Bakery', createdAt: new Date().toISOString() },
]
