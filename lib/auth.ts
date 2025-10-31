// lib/auth.ts - Custom Authentication System
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  purchasedCourses: string[]
}

// In-memory user storage (in production, use a database)
const users: User[] = [
  {
    id: '1',
    email: 'demo@studioinsight.nl',
    name: 'Demo User',
    role: 'user',
    purchasedCourses: ['1', '2', '3']
  }
]

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: Omit<User, 'purchasedCourses'>): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return users.find(user => user.email === email) || null
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const hashedPassword = await hashPassword(password)
  const newUser: User = {
    id: (users.length + 1).toString(),
    email,
    name,
    role: 'user',
    purchasedCourses: []
  }
  
  // In production, save to database
  users.push(newUser)
  
  return newUser
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email)
  if (!user) return null
  
  // In production, check hashed password from database
  // For demo purposes, we'll use a simple check
  if (password === 'demo123') {
    return user
  }
  
  return null
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) return null
    
    const decoded = verifyToken(token)
    if (!decoded) return null
    
    const user = await getUserByEmail(decoded.email)
    return user
  } catch {
    return null
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}







