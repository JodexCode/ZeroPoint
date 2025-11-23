// packages/blog/server/api/system/metrics/history.get.ts
import { defineEventHandler, getQuery } from 'h3'
import getRedisClient from '../../../utils/redis'
import { createError } from 'h3'

function parseMetric(item: string) {
  const data = JSON.parse(item)
  return {
    timestamp: data.ts,
    cpu: data.cpu,
    memory: data.mem,
    network: {
      rxSpeedKBps: data.rx,
      txSpeedKBps: data.tx,
    },
  }
}

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const range = query.range?.toString()?.toLowerCase() || '15m'

  const client = await getRedisClient()
  const now = Math.floor(Date.now() / 1000)

  if (range === '15m') {
    const minScore = now - 15 * 60
    const rawItems = await client.zRange('system:metrics:raw', minScore, now, {
      BY: 'SCORE',
    })
    const items = rawItems.slice(-15)
    return { history: items.map(parseMetric) }
  } else if (range === '24h') {
    const minScore = now - 24 * 60 * 60
    const hourlyItems = await client.zRange('system:metrics:hourly', minScore, now, {
      BY: 'SCORE',
    })
    return { history: hourlyItems.map(parseMetric) }
  } else {
    throw createError({ statusCode: 400, message: 'range 参数仅支持 15m 或 24h' })
  }
})
