// packages\blog\server\utils\db.ts
import { Pool, PoolConfig } from 'pg'
import dotenv from 'dotenv'
import { parse } from 'pg-connection-string'

dotenv.config()

let pool: Pool | null = null

function createPool(): Pool {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables')
  }

  const parsed = parse(dbUrl)

  // 安全地提取配置，将 null 转为 undefined（符合 PoolConfig 要求）
  const config: PoolConfig = {
    host: parsed.host || undefined,
    port: parsed.port ? parseInt(parsed.port, 10) : undefined,
    database: parsed.database || undefined,
    user: parsed.user || undefined,
    password: parsed.password || undefined,
    ssl: parsed.ssl === 'true' || parsed.ssl === true ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }

  return new Pool(config)
}

export function getDbPool(): Pool {
  if (!pool) {
    pool = createPool()
  }
  return pool
}

export async function query(text: string, params?: any[]) {
  const client = await getDbPool().connect()
  try {
    return await client.query(text, params)
  } finally {
    client.release()
  }
}
