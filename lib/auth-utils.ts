// Simple authentication utilities for demo purposes
export interface User {
  id: string
  email: string
  name: string
  password?: string
}

// In a real app, this would be a database
const users: User[] = []

export function createUser(email: string, password: string, name: string): User {
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  const user: User = {
    id: Date.now().toString(),
    email,
    name,
    password, // In production, this would be hashed
  }

  users.push(user)
  return { ...user, password: undefined } // Don't return password
}

export function authenticateUser(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email && u.password === password)
  if (user) {
    return { ...user, password: undefined } // Don't return password
  }
  return null
}

export function getUserById(id: string): User | null {
  const user = users.find((u) => u.id === id)
  if (user) {
    return { ...user, password: undefined }
  }
  return null
}

// Simple session management using localStorage
export function setUserSession(user: User) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export function getUserSession(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearUserSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}
