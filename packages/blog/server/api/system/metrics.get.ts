// packages/blog/server/api/system/metrics.get.ts
import { defineEventHandler } from 'h3'
import os from 'os'
import { getCookie, createError } from 'h3'
import { sessionStore } from '../../utils/sessionStore'
import {
  getDisks,
  getInstantCpuUsage,
  getNetworkInterfaces,
  getNetworkSpeed,
  checkDatabaseHealth,
} from '../../utils/system'

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

  // ✅ 并行执行所有异步操作
  const [
    cpuUsage,
    totalMem,
    freeMem,
    disksPromise,
    networkInterfaces,
    networkSpeedPromise,
    databasesPromise,
  ] = await Promise.all([
    Promise.resolve(getInstantCpuUsage()),
    Promise.resolve(os.totalmem()),
    Promise.resolve(os.freemem()),
    getDisks(), // 已缓存，极快
    Promise.resolve(getNetworkInterfaces()),
    getNetworkSpeed(),
    checkDatabaseHealth(),
  ])

  const usedMem = totalMem - freeMem
  const disks = await disksPromise
  const networkSpeed = await networkSpeedPromise
  const databases = await databasesPromise

  return {
    timestamp: new Date().toISOString(),
    cpu: { usagePercent: cpuUsage },
    memory: {
      totalMB: Math.round(totalMem / (1024 * 1024)),
      usedMB: Math.round(usedMem / (1024 * 1024)),
      freeMB: Math.round(freeMem / (1024 * 1024)),
      usagePercent: Math.round((usedMem / totalMem) * 1000) / 10,
    },
    system: {
      uptimeSeconds: os.uptime(),
      loadAverage: os.platform() === 'win32' ? null : os.loadavg(),
    },
    disks,
    network: {
      interfaces: networkInterfaces,
      total: networkSpeed,
    },
    databases,
  }
})
