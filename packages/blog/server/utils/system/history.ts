// packages/blog/server/utils/system/history.ts
import type { SystemMetrics } from '../../types/system'

// 内存中的环形缓冲区（重启清空，但够用）
const HISTORY_MAX_LENGTH = 90 // 15分钟 * 每10秒1次 = 90点
export const metricsHistory: SystemMetrics[] = []

let isCollecting = false

// 启动采集（只调用一次）
export function startMetricsCollection(collectFn: () => Promise<SystemMetrics>) {
  if (isCollecting) return
  isCollecting = true

  // 立即采集一次
  collectAndStore(collectFn)

  // 每10秒采集
  setInterval(() => collectAndStore(collectFn), 10_000)
}

async function collectAndStore(collectFn: () => Promise<SystemMetrics>) {
  try {
    const snapshot = await collectFn()
    metricsHistory.push(snapshot)
    if (metricsHistory.length > HISTORY_MAX_LENGTH) {
      metricsHistory.shift()
    }
  } catch (err) {
    console.warn('Failed to collect system metrics for history:', err)
  }
}
