/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user')

    if (!storedUser) {
      return null
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      return parsedUser && typeof parsedUser === 'object' ? parsedUser : null
    } catch {
      return null
    }
  })

  const login = (newToken, newUser) => {
    const isValidUser = newUser && typeof newUser === 'object'
    setToken(newToken)
    setUser(isValidUser ? newUser : null)
    localStorage.setItem('token', newToken)

    if (isValidUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
    } else {
      localStorage.removeItem('user')
    }
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
