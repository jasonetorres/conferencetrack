"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getUserSession, setUserSession, clearUserSession, type User } from "@/lib/auth-utils"

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const sessionUser = getUserSession()
    setUser(sessionUser)
    setIsLoading(false)
  }, [])

  const login = (user: User) => {
    setUser(user)
    setUserSession(user)
  }

  const logout = () => {
    setUser(null)
    clearUserSession()
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
