import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

// HOOK_BACKEND_HERE: Replace with your auth API base URL, e.g. import.meta.env.VITE_AUTH_API_URL
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL ?? ''

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  // Auth state: null when not logged in; { user, token } from backend when logged in
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('kingston_auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.user && parsed?.token) return parsed.user
      }
    } catch (_) {}
    return null
  })
  const [token, setToken] = useState(() => {
    try {
      const stored = localStorage.getItem('kingston_auth')
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed?.token ?? null
      }
    } catch (_) {}
    return null
  })

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const addChatMessage = useCallback((role, content) => {
    setChatHistory((prev) => [...prev, { role, content, id: Date.now() }])
  }, [])

  const clearChatHistory = useCallback(() => {
    setChatHistory([])
  }, [])

  /**
   * Login with email and password. HOOK_BACKEND_HERE: replace with your auth API.
   * Backend should return { user: { id, email, ... }, token: string }.
   * @returns {{ success: boolean, error?: string }}
   */
  const login = useCallback(async (email, password) => {
    if (!email?.trim() || !password) {
      return { success: false, error: 'Email and password are required.' }
    }
    try {
      // HOOK_BACKEND_HERE: Call your login API, e.g.:
      // const res = await fetch(`${AUTH_API_URL}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email: email.trim(), password }),
      // })
      // if (!res.ok) {
      //   const data = await res.json().catch(() => ({}))
      //   return { success: false, error: data.message ?? 'Login failed' }
      // }
      // const data = await res.json()
      // const { user: userData, token: authToken } = data
      // setUser(userData)
      // setToken(authToken)
      // localStorage.setItem('kingston_auth', JSON.stringify({ user: userData, token: authToken }))
      // return { success: true }

      // Placeholder: accept any email/password for demo (remove when backend is connected)
      const mockUser = { id: '1', email: email.trim(), name: email.trim().split('@')[0] }
      const mockToken = 'mock-jwt-placeholder'
      setUser(mockUser)
      setToken(mockToken)
      localStorage.setItem('kingston_auth', JSON.stringify({ user: mockUser, token: mockToken }))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message ?? 'Login failed.' }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('kingston_auth')
  }, [])

  const value = {
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    chatHistory,
    addChatMessage,
    clearChatHistory,
    user,
    token,
    login,
    logout,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
