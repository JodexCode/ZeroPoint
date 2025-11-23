// packages\blog\server\utils\sessionStore.ts
import { AdminSessionData, AdminSessionDataSchema } from '../types/session'
import getRedisClient from './redis'

const SESSION_PREFIX = 'session:'
const SESSION_TTL = 7 * 24 * 60 * 60

export const sessionStore = {
  async set(token: string, data: AdminSessionData): Promise<void> {
    const client = await getRedisClient()
    const key = SESSION_PREFIX + token
    await client.setEx(key, SESSION_TTL, JSON.stringify(data))
  },

  async get(token: string): Promise<AdminSessionData | null> {
    const client = await getRedisClient()
    const key = SESSION_PREFIX + token
    const data = await client.get(key)
    if (!data) return null

    try {
      const parsed = JSON.parse(data)
      const validated = AdminSessionDataSchema.parse(parsed) // 👈 关键：运行时验证
      return validated
    } catch (error) {
      console.warn('Invalid session data format, deleting:', key, error)
      await client.del(key) // 可选：自动清理损坏的 session
      return null
    }
  },

  async delete(token: string): Promise<boolean> {
    const client = await getRedisClient()
    const key = SESSION_PREFIX + token
    const result = await client.del(key)
    return result === 1
  },

  cleanupExpired(): void {
    // Redis 自动过期，无需操作
  },
}
