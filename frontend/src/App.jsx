import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './features/shared/Toast'
import Navbar from './features/shared/Navbar'
import LandingPage from './features/auth/LandingPage'
import LoginPage from './features/auth/LoginPage'
import VendorPage from './features/vendor/VendorPage'
import ClaimantPage from './features/claimant/ClaimantPage'

// Guard: redirect to '/' if not logged in, or to correct portal if role mismatch
function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (user.role !== role) return <Navigate to={user.role === 'vendor' ? '/vendor' : '/claimant'} replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Navigate to={user.role === 'vendor' ? '/vendor' : '/claimant'} replace /> : <LandingPage />} />
          <Route path="/login/:role" element={user ? <Navigate to={user.role === 'vendor' ? '/vendor' : '/claimant'} replace /> : <LoginPage />} />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute role="vendor">
                <VendorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/claimant"
            element={
              <ProtectedRoute role="claimant">
                <ClaimantPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AppProvider>
    </AuthProvider>
  )
}
