import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Props: children. Demo state lasts only until the page is refreshed.
export function AuthProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false)

  function signIn(email) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new Error('Enter a valid email address.')
    }
    setIsSignedIn(true)
  }

  function signOut() {
    setIsSignedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider.')
  return context
}
