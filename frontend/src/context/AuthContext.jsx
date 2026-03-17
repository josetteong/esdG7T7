import { createContext, useContext, useState } from 'react'
import { ACCOUNTS } from '../data/accounts'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { email, name, role }

  const login = (role, email, password) => {
    const match = ACCOUNTS[role]?.find(
      (a) => a.email === email.toLowerCase().trim() && a.password === password
    )
    if (!match) return false
    setUser({ ...match, role })
    return true
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
