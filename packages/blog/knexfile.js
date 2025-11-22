// packages\blog\knexfile.js
import dotenv from 'dotenv'
dotenv.config()

const dbUrl = process.env.DATABASE_URL

export default {
  client: 'pg',
  connection: dbUrl,
  migrations: {
    tableName: 'knex_migrations',
    directory: './server/database/migrations',
  },
  seeds: {
    directory: './server/database/seeds',
  },
}
