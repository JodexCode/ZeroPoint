// packages/blog/server/plugins/metrics-history.ts
import { startMetricsCollection } from '../utils/system/history'

export default defineNitroPlugin(() => {
  // 服务启动时自动开始采集历史数据
  startMetricsCollection()
})
