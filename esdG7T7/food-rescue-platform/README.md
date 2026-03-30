# Food Rescue Platform

A web platform connecting food vendors with NGOs and beneficiaries to redistribute surplus food before it goes to waste.

## Tech stack

- **Vite** + **React 18**
- **React Router v6** — client-side routing
- **Tailwind CSS** — utility-first styling
- **ESLint** + **Prettier** — linting and formatting

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run

```bash
# 1. Clone the repo
git clone https://github.com/your-org/food-rescue-platform.git
cd food-rescue-platform

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Demo accounts

### Vendors
| Email | Password | Name |
|---|---|---|
| bakery@example.com | pass123 | Sunshine Bakery |
| supermart@example.com | pass123 | SuperMart SG |

### Claimants
| Email | Password | Name |
|---|---|---|
| ngo@example.com | pass123 | Hope NGO |
| beneficiary@example.com | pass123 | Jane Lim |

---

## Project structure

```
src/
├── context/
│   ├── AuthContext.jsx       # Login / logout state
│   └── AppContext.jsx        # Listings, reservations, claimant state
├── data/
│   ├── accounts.js           # Demo accounts (replace with real auth)
│   └── seed.js               # Seed listings for demo (remove for production)
├── features/
│   ├── auth/
│   │   ├── LandingPage.jsx   # Role selection screen
│   │   └── LoginPage.jsx     # Email / password login
│   ├── vendor/
│   │   ├── VendorPage.jsx    # Vendor dashboard
│   │   ├── PostListingForm.jsx
│   │   └── VendorListings.jsx
│   ├── claimant/
│   │   ├── ClaimantPage.jsx  # Claimant dashboard
│   │   ├── BrowseListings.jsx
│   │   └── MyReservations.jsx
│   └── shared/
│       ├── Navbar.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── utils.js
├── App.jsx                   # Route definitions + providers
├── main.jsx                  # React DOM entry point
└── index.css                 # Tailwind directives + global component classes
```

---

## Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Build for production (output: `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Auto-format with Prettier |

---

## Connecting a backend

All state currently lives in React context (`AppContext`). To connect a real backend:

1. **Replace** `src/data/accounts.js` with real authentication API calls in `AuthContext.jsx`
2. **Replace** `src/data/seed.js` and context `useState` initialisations with `useEffect` + `fetch`/`axios` calls
3. **Replace** action functions in `AppContext.jsx` (e.g. `postListing`, `claimListing`) with API mutations
4. Delete `src/data/seed.js` once the backend is wired up

## Routes

| Path | Component | Access |
|---|---|---|
| `/` | LandingPage | Public |
| `/login/:role` | LoginPage | Public |
| `/vendor` | VendorPage | Vendor only |
| `/claimant` | ClaimantPage | Claimant only |
