// packages/blog/server/types/system.ts
export interface SystemMetrics {
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
  disks: Array<{
    mount: string
    filesystem: string
    totalGB: number
    usedGB: number
    freeGB: number
    usagePercent: number
  }>
  network: {
    interfaces: Array<{ name: string; address: string; mac: string; internal: boolean }>
    total: {
      rxBytes: number
      txBytes: number
      rxSpeedKBps: number
      txSpeedKBps: number
    }
  }
  databases: {
    postgresql: any
    redis: any
  }
}
