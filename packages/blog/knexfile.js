// packages/blog/knexfile.js
import dotenv from 'dotenv'
import { parse } from 'pg-connection-string' // 👈 新增：解析 DATABASE_URL

dotenv.config()

const dbUrl = process.env.DATABASE_URL

if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined in environment variables')
}

// 解析 DATABASE_URL 为 Knex 可识别的对象
const connection = parse(dbUrl)

export default {
  client: 'pg',
  connection: {
    ...connection,
    ssl:
      connection.ssl === 'true' || connection.ssl === true ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './server/database/migrations',
  },
  seeds: {
    directory: './server/database/seeds',
  },
}
