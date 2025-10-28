// lib/user-database.ts - Database User Service
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export class UserService {
  // Convert Prisma User to our User interface
  private static convertPrismaUser(prismaUser: any): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      createdAt: prismaUser.createdAt.toISOString(),
      updatedAt: prismaUser.updatedAt.toISOString(),
    }
  }

  static async createUser(email: string, password: string, name?: string): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        throw new Error('User already exists')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: UserRole.USER
        }
      })

      return this.convertPrismaUser(newUser)
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        return null
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return null
      }

      return this.convertPrismaUser(user)
    } catch (error) {
      console.error('Error authenticating user:', error)
      return null
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      })

      return user ? this.convertPrismaUser(user) : null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      return user ? this.convertPrismaUser(user) : null
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  static async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updates
      })

      return this.convertPrismaUser(updatedUser)
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  static async createDefaultAdmin(): Promise<User | null> {
    try {
      // Check if admin already exists
      const existingAdmin = await prisma.user.findFirst({
        where: { role: UserRole.ADMIN }
      })

      if (existingAdmin) {
        return this.convertPrismaUser(existingAdmin)
      }

      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const admin = await prisma.user.create({
        data: {
          email: 'admin@studio-insight.nl',
          password: hashedPassword,
          name: 'Admin',
          role: UserRole.ADMIN
        }
      })

      return this.convertPrismaUser(admin)
    } catch (error) {
      console.error('Error creating default admin:', error)
      return null
    }
  }
}
