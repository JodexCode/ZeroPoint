// packages/blog/server/plugins/metrics-history.ts
import { startMetricsCollection } from '../utils/system/history'
import { collectAllMetrics } from '../utils/system'

export default defineNitroPlugin(() => {
  // 服务启动时自动开始采集历史数据
  startMetricsCollection(collectAllMetrics)
})
