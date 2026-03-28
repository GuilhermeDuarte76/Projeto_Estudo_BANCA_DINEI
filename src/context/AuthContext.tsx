import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { loginUser, registerUser, logoutUser } from '../services/auth'
import { getAccessToken, clearTokens } from '../services/api'

export interface AuthUser {
  name: string
  email: string
  role: string
}

// ── Context 1: user state (stable — consumers don't re-render on modal open/close) ──
interface AuthUserContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  openAuthModal: () => void
}

// ── Context 2: modal state (only AuthModal subscribes to this) ──
interface AuthModalContextType {
  authModalOpen: boolean
  closeAuthModal: () => void
}

function decodeJwt(token: string): AuthUser | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    const name =
      decoded.name ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      'Usuário'
    const email =
      decoded.email ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      ''
    const role =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      'Customer'
    return { name, email, role }
  } catch {
    return null
  }
}

const AuthUserContext = createContext<AuthUserContextType | null>(null)
const AuthModalContext = createContext<AuthModalContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    if (token) setUser(decodeJwt(token))
    setIsLoading(false)
  }, [])

  const openAuthModal = useCallback(() => setAuthModalOpen(true), [])
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [])

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await loginUser(email, password)
    if (res.success) {
      const token = getAccessToken()
      if (token) setUser(decodeJwt(token))
    }
    return { success: res.success, message: res.message }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password)
    if (res.success) {
      const token = getAccessToken()
      if (token) setUser(decodeJwt(token))
    }
    return { success: res.success, message: res.message }
  }, [])

  const signOut = useCallback(async () => {
    await logoutUser()
    clearTokens()
    setUser(null)
  }, [])

  // Context 1 value — only changes on user/loading state change, NOT on modal open/close
  const userValue = useMemo(
    () => ({ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut, openAuthModal }),
    [user, isLoading, signIn, signUp, signOut, openAuthModal],
  )

  // Context 2 value — only AuthModal subscribes to this
  const modalValue = useMemo(
    () => ({ authModalOpen, closeAuthModal }),
    [authModalOpen, closeAuthModal],
  )

  return (
    <AuthUserContext.Provider value={userValue}>
      <AuthModalContext.Provider value={modalValue}>
        {children}
      </AuthModalContext.Provider>
    </AuthUserContext.Provider>
  )
}

/** Hook for user state — Navbar, cart, pages (does NOT re-render on modal open/close) */
export function useAuth() {
  const ctx = useContext(AuthUserContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Hook for modal state — only for AuthModal */
export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error('useAuthModal must be used within AuthProvider')
  return ctx
}
