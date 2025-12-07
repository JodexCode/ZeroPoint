// packages/blog/scripts/runMigrations.ts
import dotenv from 'dotenv'
import { join } from 'path'
import * as fs from 'fs'
import { getDbPool } from '../server/utils/db'

// 加载 .env 文件，确保数据库连接可用
dotenv.config({ path: join(__dirname, '..', '.env') })

async function runMigrations() {
  const sqlPath = join(__dirname, '..', 'server', 'database', 'migrations', '001-init-schema.sql')

  // 检查 SQL 文件是否存在
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ 迁移文件不存在：${sqlPath}`)
    process.exit(1)
  }

  const pool = getDbPool()
  const client = await pool.connect()

  try {
    const sql = fs.readFileSync(sqlPath, 'utf8')
    await client.query(sql)
    console.log('✅ 数据库表结构已成功初始化')
  } catch (err) {
    console.error('❌ 数据库迁移失败：', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
