// packages/blog/server/api/system/metrics/history.get.ts
import { defineEventHandler } from 'h3'
import { getCookie, createError } from 'h3'
import { sessionStore } from '../../../utils/sessionStore'
import { metricsHistory } from '../../../utils/system/history'

async function requireAuth(event: any) {
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    throw createError({ statusCode: 401, message: '未提供会话凭证' })
  }
  const session = await sessionStore.get(sessionToken)
  if (!session) {
    throw createError({ statusCode: 401, message: '会话无效' })
  }
}

export default defineEventHandler(async event => {
  await requireAuth(event)

  // 只返回必要字段，减少体积
  const simplified = metricsHistory.map(m => ({
    timestamp: m.timestamp,
    cpu: m.cpu.usagePercent,
    memory: m.memory.usagePercent,
    network: {
      rxSpeedKBps: m.network.total.rxSpeedKBps,
      txSpeedKBps: m.network.total.txSpeedKBps,
    },
  }))

  return { history: simplified }
})
