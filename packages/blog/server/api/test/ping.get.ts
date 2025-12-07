// server/api/test/ping.get.ts
import { defineEventHandler } from 'h3'
import { query } from '../../utils/db' // ← 唯一正确的导入
import getRedisClient from '../../utils/redis'
import { getI18n } from '../../utils/i18n'

export default defineEventHandler(async event => {
  const timestamp = new Date().toISOString()
  const env = process.env.NODE_ENV || 'development'

  const { t } = await getI18n(event)

  const dbResult = { connected: false, message: '', error: null as string | null }
  const redisResult = { connected: false, message: '', error: null as string | null }

  // --- PostgreSQL 健康检查（原生 pg）---
  try {
    await query('SELECT 1') // ← 直接使用原生 query，无 Knex
    dbResult.connected = true
    dbResult.message = t('dbOk')
  } catch (err: any) {
    const errorMsg = err.message || t('unknownError')
    dbResult.error = errorMsg
    dbResult.message = t('dbFail', { error: errorMsg })
  }

  // --- Redis 健康检查 ---
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
