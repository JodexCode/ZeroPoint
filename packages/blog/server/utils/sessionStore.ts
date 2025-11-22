// server/utils/sessionStore.ts
import type { AdminSessionData } from '../types/session'
import getRedisClient from './redis' // ← 改为导入函数

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 7 * 24 * 60 * 60 // 7 天（秒）

export const sessionStore = {
  async set(token: string, data: AdminSessionData): Promise<void> {
    const client = await getRedisClient() // ← 懒加载连接
    const key = SESSION_PREFIX + token
    await client.setEx(key, SESSION_TTL, JSON.stringify(data))
  },

  async get(token: string): Promise<AdminSessionData | null> {
    const client = await getRedisClient()
    const key = SESSION_PREFIX + token
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  },

  async delete(token: string): Promise<boolean> {
    const client = await getRedisClient()
    const key = SESSION_PREFIX + token
    const result = await client.del(key)
    return result === 1
  },

  cleanupExpired(): void {
    // redis 会自动处理过期键，无需手动清理
  },
}
