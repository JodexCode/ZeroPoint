// packages/admin/src/apis/monitor.ts
import http from '@/utils/http'
import type { SystemMetricsRaw, SystemInfoRaw, SystemMetricsHistoryResponse } from '@/types/monitor'

// packages/admin/src/apis/monitor.ts

/**
 * 获取原始系统指标（直接对应后端返回）
 */
export function getSystemMetrics(): Promise<SystemMetricsRaw> {
  return http.get('/api/system/metrics')
}

// ============ System Info ============

/**
 * 获取系统基本信息（OS、CPU 型号等）
 */
export function getSystemInfo(): Promise<SystemInfoRaw> {
  return http.get('/api/system/info')
}

/**
 * 获取系统指标历史数据
 */
export function getSystemMetricsHistory(
  range: '15m' | '24h' = '15m'
): Promise<SystemMetricsHistoryResponse> {
  return http.get('/api/system/metrics/history', { params: { range } })
}
