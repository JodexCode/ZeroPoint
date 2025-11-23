// packages\blog\server\utils\redis.ts
import { createClient } from 'redis'

type RedisClient = ReturnType<typeof createClient>

declare global {
  var redisClient: RedisClient | undefined
}

const getRedisClient = async (): Promise<RedisClient> => {
  if (!globalThis.redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
    const client = createClient({ url: redisUrl })

    client.on('error', err => {
      console.error('❌ Redis Client Error:', err)
    })

    await client.connect()
    globalThis.redisClient = client
  }

  return globalThis.redisClient
}

export default getRedisClient
