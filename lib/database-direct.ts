// lib/database-direct.ts - Direct PostgreSQL database service
import { Pool } from 'pg'

let pool: Pool | null = null

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  }
  return pool
}

export class DatabaseService {
  static async query(text: string, params?: any[]) {
    const pool = getPool()
    return await pool.query(text, params)
  }

  static async getUserCount() {
    const result = await this.query('SELECT COUNT(*) as count FROM users')
    return parseInt(result.rows[0].count)
  }

  static async getProductCount() {
    const result = await this.query('SELECT COUNT(*) as count FROM products')
    return parseInt(result.rows[0].count)
  }

  static async getOrderCount() {
    const result = await this.query('SELECT COUNT(*) as count FROM orders')
    return parseInt(result.rows[0].count)
  }

  static async getAllUsers() {
    const result = await this.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC')
    return result.rows
  }

  static async getProducts() {
    const result = await this.query('SELECT id, name, description, price, type, category, is_active FROM products ORDER BY created_at DESC')
    return result.rows
  }

  static async createUser(email: string, name: string, password: string) {
    const result = await this.query(
      'INSERT INTO users (id, email, name, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, name, role',
      [crypto.randomUUID(), email, name, password, 'USER']
    )
    return result.rows[0]
  }

  static async close() {
    if (pool) {
      await pool.end()
      pool = null
    }
  }
}
