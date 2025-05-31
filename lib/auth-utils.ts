import bcrypt from "bcryptjs"
import CryptoJS from "crypto-js"
import * as jose from "jose"

const STORAGE_KEY = "user_session"
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-replace-in-production"
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-replace-in-production")

export interface User {
  id: string
  email: string
  name: string
  password?: string
}

// In a real app, this would be a database
const users: User[] = []

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const existingUser = users.find((u) => u.email === email)
  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(password, 10)

  const user: User = {
    id: Date.now().toString(),
    email,
    name,
    password: hashedPassword,
  }

  users.push(user)
  return { ...user, password: undefined }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.email === email)
  if (!user || !user.password) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return { ...user, password: undefined }
}

export function getUserById(id: string): User | null {
  const user = users.find((u) => u.id === id)
  if (user) {
    return { ...user, password: undefined }
  }
  return null
}

// Create encrypted JWT token
async function createSessionToken(user: User): Promise<string> {
  const token = await new jose.SignJWT({ 
    id: user.id,
    email: user.email,
    name: user.name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

// Verify and decode JWT token
async function verifySessionToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as User
  } catch {
    return null
  }
}

// Encrypt data before storing in localStorage
function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
}

// Decrypt data from localStorage
function decryptData(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}

export async function setUserSession(user: User) {
  if (typeof window !== "undefined") {
    const token = await createSessionToken(user)
    const encryptedToken = encryptData(token)
    localStorage.setItem(STORAGE_KEY, encryptedToken)
  }
}

export async function getUserSession(): Promise<User | null> {
  if (typeof window !== "undefined") {
    const encryptedToken = localStorage.getItem(STORAGE_KEY)
    if (!encryptedToken) return null

    try {
      const token = decryptData(encryptedToken)
      return await verifySessionToken(token)
    } catch {
      clearUserSession()
      return null
    }
  }
  return null
}

export function clearUserSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}