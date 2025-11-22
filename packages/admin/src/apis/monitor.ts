// packages/admin/src/apis/monitor.ts
import http from '@/utils/http'

// packages/admin/src/apis/monitor.ts

export interface DiskInfo {
  mount: string
  filesystem: string
  totalGB: number
  usedGB: number
  freeGB: number
  usagePercent: number
}

export interface SystemMetricsRaw {
  timestamp: string
  cpu: {
    usagePercent: number
  }
  memory: {
    totalMB: number
    usedMB: number
    freeMB: number
    usagePercent: number
  }
  system: {
    uptimeSeconds: number
    loadAverage: number[] | null // Windows 可能为 null
  }
  disks: DiskInfo[]
}

/**
 * 获取原始系统指标（直接对应后端返回）
 */
export function getSystemMetrics(): Promise<SystemMetricsRaw> {
  return http.get('/api/system/metrics')
}

// ============ System Info ============

export interface OsInfo {
  platform: string
  type: string
  family: string
  release: string
  version: string
  distro: string | null
  arch: string
  hostname: string
}

export interface CpuInfo {
  cores: number
  model: string
}

export interface SystemInfoRaw {
  timestamp: string
  os: OsInfo
  cpu: CpuInfo
}

/**
 * 获取系统基本信息（OS、CPU 型号等）
 */
export function getSystemInfo(): Promise<SystemInfoRaw> {
  return http.get('/api/system/info')
}

export interface SystemMetricsHistoryItem {
  timestamp: string // ISO 8601 时间戳
  cpu: number // 百分比数值
  memory: number // 百分比数值
  network: {
    rxSpeedKBps: number
    txSpeedKBps: number
  }
}

export interface SystemMetricsHistoryResponse {
  history: SystemMetricsHistoryItem[]
}

/**
 * 获取系统指标历史数据
 */
export function getSystemMetricsHistory(): Promise<SystemMetricsHistoryResponse> {
  return http.get('/api/system/metrics/history')
}
