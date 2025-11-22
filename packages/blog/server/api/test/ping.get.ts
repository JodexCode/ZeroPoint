// server/api/test/ping.get.ts
import { defineEventHandler } from 'h3'
import getDb from '../../utils/db'
import getRedisClient from '../../utils/redis'
import { getI18n } from '../../utils/i18n'

export default defineEventHandler(async event => {
  const timestamp = new Date().toISOString()
  const env = process.env.NODE_ENV || 'development'

  const { t } = await getI18n(event)

  const dbResult = { connected: false, message: '', error: null as string | null }
  const redisResult = { connected: false, message: '', error: null as string | null }

  // 检查数据库
  try {
    const db = await getDb()
    await db.raw('SELECT 1')
    dbResult.connected = true
    dbResult.message = t('dbOk')
  } catch (err: any) {
    const errorMsg = err.message || t('unknownError')
    dbResult.error = errorMsg
    dbResult.message = t('dbFail', { error: errorMsg })
  }

  // 检查 Redis
  try {
    const redis = await getRedisClient()
    await redis.ping()
    redisResult.connected = true
    redisResult.message = t('redisOk')
  } catch (err: any) {
    const errorMsg = err.message || t('unknownError')
    redisResult.error = errorMsg
    redisResult.message = t('redisFail', { error: errorMsg })
  }

  return {
    success: true,
    message: t('title'),
    timestamp,
    env,
    database: dbResult,
    redis: redisResult,
  }
})
