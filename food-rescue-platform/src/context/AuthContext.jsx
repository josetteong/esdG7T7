import { createContext, useContext, useState } from 'react'
import { registerClaimant, registerVendor, loginClaimant, loginVendor, reconnectTelegram as apiReconnect } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // user shape: { id, email, name, role, telegramHandle, telegramLink, needsTelegramPrompt }

  // ── Sign in ────────────────────────────────────────────────────────────────
  const login = async (role, email, password) => {
    try {
      const data = role === 'vendor'
        ? await loginVendor(email, password)
        : await loginClaimant(email, password)

      setUser({
        id: String(data.vendor_id ?? data.claimant_id),
        email: email.toLowerCase().trim(),
        name: data.vendor_name ?? data.claimant_name,
        role,
        telegramHandle: null,
        telegramLink: null,
        needsTelegramPrompt: false,
      })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message ?? 'Incorrect email or password.' }
    }
  }

  // ── Sign up ────────────────────────────────────────────────────────────────
  const signup = async (role, name, email, password) => {
    try {
      const data = role === 'vendor'
        ? await registerVendor(name, email, password)
        : await registerClaimant(name, email, password)

      setUser({
        id: String(data.vendor_id ?? data.claimant_id),
        email: email.toLowerCase().trim(),
        name: data.vendor_name ?? data.claimant_name,
        role,
        telegramHandle: null,
        telegramLink: data.telegram?.telegram_link ?? null,
        needsTelegramPrompt: true,
      })
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message ?? 'Registration failed.' }
    }
  }

  // ── Telegram ───────────────────────────────────────────────────────────────
  const saveTelegramHandle = (handle) => {
    if (!user) return
    setUser((prev) => ({ ...prev, telegramHandle: handle.replace(/^@/, '').trim() }))
  }

  const dismissTelegramPrompt = () => {
    if (!user) return
    setUser((prev) => ({ ...prev, needsTelegramPrompt: false }))
  }

  // ── Telegram reconnect ─────────────────────────────────────────────────────
  const triggerTelegramConnect = async () => {
    if (!user) return { ok: false }
    try {
      const data = await apiReconnect(user.id, user.role)
      setUser((prev) => ({ ...prev, telegramLink: data.telegram_link, needsTelegramPrompt: true }))
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.message }
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, saveTelegramHandle, dismissTelegramPrompt, triggerTelegramConnect }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
