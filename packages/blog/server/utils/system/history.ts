// packages/blog/server/utils/system/history.ts
import getRedisClient from '../../utils/redis'
import { collectAllMetrics } from './index'
import { simplifyMetric } from './metricsSimplify'

declare global {
  var __metrics_collecting__: boolean | undefined
}

const RAW_KEY = 'system:metrics:raw'
const HOURLY_KEY = 'system:metrics:hourly'
const TTL_24H = 24 * 60 * 60 // 86400 秒

export function startMetricsCollection() {
  if (globalThis.__metrics_collecting__) {
    console.warn('[Metrics] Already started globally, skip.')
    return
  }
  globalThis.__metrics_collecting__ = true

  collectAndStore()
  setInterval(collectAndStore, 60_000)
}

async function collectAndStore() {
  try {
    const snapshot = await collectAllMetrics()
    const client = await getRedisClient()

    const simplified = simplifyMetric(snapshot)
    const json = JSON.stringify(simplified)
    const timestampSec = Math.floor(new Date(snapshot.timestamp).getTime() / 1000)

    // 写入原始数据（每分钟）
    await client.zAdd(RAW_KEY, { score: timestampSec, value: json })
    await client.expire(RAW_KEY, TTL_24H)

    // 写入小时快照（保留最新值）
    const hourAligned = new Date(snapshot.timestamp)
    hourAligned.setMinutes(0, 0, 0)
    const hourScore = Math.floor(hourAligned.getTime() / 1000)

    await client.zRemRangeByScore(HOURLY_KEY, hourScore, hourScore) // 👈 关键：先删除
    await client.zAdd(HOURLY_KEY, { score: hourScore, value: json }) // 👈 再插入
    await client.expire(HOURLY_KEY, TTL_24H)

    console.debug(`[Metrics] Saved at ${snapshot.timestamp}`)
  } catch (err) {
    console.warn('Failed to collect and store metrics to Redis:', err)
  }
}
