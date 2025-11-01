// lib/user-database.ts - Database User Service (without Prisma)
import { DatabaseService } from '@/lib/database-direct'
import bcrypt from 'bcryptjs'

export type UserRole = 'USER' | 'ADMIN'

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  address?: string | null
  city?: string | null
  postcode?: string | null
  country?: string | null
  phone?: string | null
  company_name?: string | null
  industry?: string | null
  website?: string | null
  createdAt: string
  updatedAt: string
}

export class UserService {
  // Convert database row to User interface
  private static convertDbUser(dbUser: any): any {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as UserRole,
      address: dbUser.address || null,
      city: dbUser.city || null,
      postcode: dbUser.postcode || null,
      country: dbUser.country || null,
      phone: dbUser.phone || null,
      company_name: dbUser.company_name || null,
      industry: dbUser.industry || null,
      website: dbUser.website || null,
      createdAt: dbUser.created_at ? new Date(dbUser.created_at).toISOString() : new Date().toISOString(),
      updatedAt: dbUser.updated_at ? new Date(dbUser.updated_at).toISOString() : new Date().toISOString(),
    }
  }

  static async createUser(email: string, password: string, name?: string): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUsers = await DatabaseService.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      )

      if (existingUsers.length > 0) {
        throw new Error('User already exists')
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)
      const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create user
      const result = await DatabaseService.query(
        'INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, name, role, "createdAt", "updatedAt"',
        [id, email, name || null, hashedPassword, 'USER']
      )

      if (result.length === 0) {
        return null
      }

      return this.convertDbUser(result[0])
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    try {
      const result = await DatabaseService.query(
        'SELECT id, email, name, password, role, "createdAt", "updatedAt" FROM users WHERE email = $1',
        [email]
      )

      if (result.length === 0) {
        return null
      }

      const user = result[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return null
      }

      return this.convertDbUser(user)
    } catch (error) {
      console.error('Error authenticating user:', error)
      return null
    }
  }

  static async getUserById(id: string): Promise<any> {
    try {
      // Cast id to UUID if needed, or use as string
      const result = await DatabaseService.query(
        'SELECT id, email, name, role, address, city, postcode, country, phone, company_name, industry, website, created_at, updated_at FROM users WHERE id::text = $1',
        [id.toString()]
      )

      if (result.length === 0) {
        return null
      }

      return this.convertDbUser(result[0])
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  static async getUserByEmail(email: string): Promise<any> {
    try {
      // Use LOWER() to make email comparison case-insensitive
      const result = await DatabaseService.query(
        'SELECT id, email, name, role, address, city, postcode, country, phone, company_name, industry, website, created_at, updated_at FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      )

      if (result.length === 0) {
        return null
      }

      return this.convertDbUser(result[0])
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  }

  static async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
      const updateFields: string[] = []
      const updateValues: any[] = []
      let paramIndex = 1

      if (updates.email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`)
        updateValues.push(updates.email)
      }
      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`)
        updateValues.push(updates.name)
      }
      if (updates.role !== undefined) {
        updateFields.push(`role = $${paramIndex++}`)
        updateValues.push(updates.role)
      }

      if (updateFields.length === 0) {
        return this.getUserById(id)
      }

      updateFields.push(`"updatedAt" = NOW()`)
      updateValues.push(id)

      const result = await DatabaseService.query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, role, "createdAt", "updatedAt"`,
        updateValues
      )

      if (result.length === 0) {
        return null
      }

      return this.convertDbUser(result[0])
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  static async deleteUser(id: string): Promise<boolean> {
    try {
      await DatabaseService.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      )
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  static async createDefaultAdmin(): Promise<User | null> {
    try {
      // Check if admin already exists
      const existingAdmins = await DatabaseService.query(
        'SELECT id, email, name, role, "createdAt", "updatedAt" FROM users WHERE role = $1 LIMIT 1',
        ['ADMIN']
      )

      if (existingAdmins.length > 0) {
        return this.convertDbUser(existingAdmins[0])
      }

      // Create default admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      const id = `admin-${Date.now()}`

      const result = await DatabaseService.query(
        'INSERT INTO users (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, name, role, "createdAt", "updatedAt"',
        [id, 'admin@studio-insight.nl', 'Admin', hashedPassword, 'ADMIN']
      )

      if (result.length === 0) {
        return null
      }

      return this.convertDbUser(result[0])
    } catch (error) {
      console.error('Error creating default admin:', error)
      return null
    }
  }
}