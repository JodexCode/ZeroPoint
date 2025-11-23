// packages/blog/server/api/system/metrics.get.ts
import { defineEventHandler } from 'h3'
import os from 'os'
import {
  getDisks,
  getInstantCpuUsage,
  getNetworkInterfaces,
  getNetworkSpeed,
  checkDatabaseHealth,
} from '../../utils/system'

export default defineEventHandler(async () => {
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
    getDisks(),
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
