// packages/blog/scripts/runSeeds.ts
import dotenv from 'dotenv'
import { join } from 'path'
import * as bcrypt from 'bcryptjs'
import { getDbPool } from '../server/utils/db'

// 加载 .env 文件（位于 packages/blog/.env）
dotenv.config({ path: join(__dirname, '..', '.env') })

async function runSeeds() {
  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    console.error('❌ 错误：未在 packages/blog/.env 中设置 ADMIN_PASSWORD')
    console.error('请先配置管理员密码后再运行种子脚本。')
    process.exit(1)
  }

  const pool = getDbPool()
  const client = await pool.connect()

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await client.query(
      `
      INSERT INTO admins (username, password_hash, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (username) DO NOTHING;
      `,
      [username, hashedPassword]
    )

    console.log(`✅ 管理员账号 "${username}" 已成功初始化（若不存在）`)
  } catch (err) {
    console.error('❌ 初始化管理员账号失败：', err)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

runSeeds()
