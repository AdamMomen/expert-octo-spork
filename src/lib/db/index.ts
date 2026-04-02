import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://testlab:testlab@localhost:5432/testlab'
})

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const result = await pool.query(sql, params)
  return result.rows
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const result = await pool.query(sql, params)
  return result.rows[0] || null
}

export const db = { query, queryOne }
