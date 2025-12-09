// packages/blog/server/utils/system/index.ts
import os from 'os'
import { getDisks } from './disk'
import { getInstantCpuUsage } from './cpu'
import { getNetworkInterfaces, getNetworkSpeed } from './network'
import { checkDatabaseHealth } from './database'

// 👇 新增：统一收集函数（供 history 使用）
export async function collectAllMetrics() {
  const [cpuUsage, totalMem, freeMem, disks, networkInterfaces, networkSpeed, databases] =
    await Promise.all([
      getInstantCpuUsage(),
      Promise.resolve(os.totalmem()),
      Promise.resolve(os.freemem()),
      getDisks(),
      Promise.resolve(getNetworkInterfaces()),
      getNetworkSpeed(),
      checkDatabaseHealth(),
    ])

  const usedMem = totalMem - freeMem

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
}

// 重新导出原有 API（保持兼容）
export { getDisks, getInstantCpuUsage, getNetworkSpeed, getNetworkInterfaces, checkDatabaseHealth }
