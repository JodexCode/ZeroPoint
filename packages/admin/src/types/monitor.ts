// packages\admin\src\types\monitor.ts

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
  cpu: { usagePercent: number }
  memory: {
    totalMB: number
    usedMB: number
    freeMB: number
    usagePercent: number
  }
  system: {
    uptimeSeconds: number
    loadAverage: number[] | null
  }
  disks: DiskInfo[]
  network: {
    interfaces: Array<{
      name: string
      address: string
      mac: string
      internal: boolean
    }>
    total: {
      rxBytes: number
      txBytes: number
      rxSpeedKBps: number
      txSpeedKBps: number
    }
  }
  databases: {
    postgresql: DatabaseStatus
    redis: DatabaseStatus
  }
}

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

export interface SystemMetricsHistoryItem {
  timestamp: string // ISO 8601 时间戳
  cpu: number // 百分比数值
  memory: number // 百分比数值
  network: {
    rxSpeedKBps: number
    txSpeedKBps: number
  }
}

export interface DatabaseStatus {
  connected: boolean
  version?: string
  connections?: number
  maxConnections?: number // 👈 PostgreSQL
  maxClients?: number // 👈 Redis
  uptimeSeconds?: number
  usedMemoryMB?: number
  connectedClients?: number
  error?: string | null
}

export interface SystemMetricsHistoryResponse {
  history: SystemMetricsHistoryItem[]
}
