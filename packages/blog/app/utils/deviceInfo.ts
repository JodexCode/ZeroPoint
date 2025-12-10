export interface DeviceInfo {
  deviceModel: string
  systemVersion: string
  networkType: string
  networkSpeed: string
}

export class DeviceInfoService {
  private static instance: DeviceInfoService
  static getInstance(): DeviceInfoService {
    if (!this.instance) this.instance = new DeviceInfoService()
    return this.instance
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    if (typeof window === 'undefined')
      return { deviceModel: '', systemVersion: '', networkType: '', networkSpeed: '' }

    // ① 立刻能拿到的字段（零等待）
    const ua = navigator.userAgent
    const conn = (navigator as any).connection
    const instant: Partial<DeviceInfo> = {
      deviceModel: this.parseUADevice(ua),
      systemVersion: this.parseUAVersion(ua),
      networkType: this.getNetworkType(), // ← 这里补上调用
      networkSpeed: conn?.rtt ? `${conn.rtt} ms` : '',
    }

    // ② 后台并发跑异步任务（真机补充）
    const [model, version, speed] = await Promise.all([
      this.getRealModel(),
      this.getRealVersion(),
      this.getRealSpeed(),
    ])

    // ③ 合并结果（逐项更新）
    return {
      deviceModel: model || instant.deviceModel!,
      systemVersion: version || instant.systemVersion!,
      networkType: instant.networkType!,
      networkSpeed: speed || instant.networkSpeed!,
    }
  }

  /* ---------- 立刻 UA 解析 ---------- */
  private parseUADevice(ua: string): string {
    if (/Android/i.test(ua)) {
      const bracket = ua.match(/\(([^)]+)\)/)
      const raw = bracket?.[1] ?? ''
      if (!raw) return 'Android Device'
      const last = (
        raw
          .split(';')
          .map(s => s.trim())
          .filter(Boolean) || ['']
      ).at(-1)!
      if (last.length > 60 || !last) return 'Android Device'
      return last.split('Build')[0]?.trim().replace(/\)$/, '') ?? last
    }
    if (/iPhone|iPad/i.test(ua)) {
      if ('userAgentData' in navigator) {
        try {
          const ud = (navigator as any).userAgentData
          const hv = ud.getHighEntropyValues(['model'])
          if (hv.model) return hv.model.replace(/,/g, ' ')
        } catch {
          /* 高熵值失败 */
        }
      }
      const m = ua.match(/\((iPhone[^;)]+|iPad[^;)]+)\)/)
      if (m?.[1]) return m[1].replace(/;/g, '')
      return /iPad/i.test(ua) ? 'iPad' : 'iPhone'
    }
    if (/Windows/i.test(ua)) return 'Windows PC'
    if (/Mac/i.test(ua)) {
      const m = ua.match(/Mac OS X ([\d_.]+)/)
      return m?.[1] ? `macOS ${m[1].replace(/_/g, '.')}` : 'Mac Device'
    }
    return 'Unknown Device'
  }

  private parseUAVersion(ua: string): string {
    if (/iPhone|iPad/i.test(ua)) {
      const v = ua.match(/OS (\d+[_.]\d+)/)
      return v?.[1] ? `iOS ${v[1].replace(/_/g, '.')}` : 'iOS'
    }
    if (/Mac/i.test(ua) && !/iPhone|iPad/i.test(ua)) {
      const m = ua.match(/Mac OS X (\d+[_.]\d+[_.]\d+)/)
      if (m?.[1]) {
        const v = m[1].replace(/_/g, '.')
        const map: Record<string, string> = {
          '10.15': 'Catalina',
          '10.14': 'Mojave',
          '10.13': 'High Sierra',
          '10.12': 'Sierra',
          '11.': 'Big Sur',
          '12.': 'Monterey',
          '13.': 'Ventura',
          '14.': 'Sonoma',
        }
        for (const [k, name] of Object.entries(map))
          if (v.startsWith(k)) return `macOS ${name} (${v})`
        return `macOS ${v}`
      }
      return 'macOS'
    }
    if (/Windows/i.test(ua)) {
      if (/Windows NT 10\.0/i.test(ua)) {
        const buildMatch = ua.match(/Windows NT 10\.0.+?(\d{5,})/)
        const build = Number(buildMatch?.[1] || 0)
        return build >= 22000 ? 'Windows 11' : 'Windows 10'
      }
      if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1'
      if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7'
      return 'Windows'
    }
    if (/Android/i.test(ua)) {
      const m = ua.match(/Android (\d+\.\d+)/)
      return m?.[1] ? `Android ${m[1]}` : 'Android'
    }
    return 'Unknown System'
  }

  /* ---------- 网络类型（立刻 connection API） ---------- */
  private getNetworkType(): string {
    const conn = (navigator as any).connection
    if (conn) {
      const type = conn.networkType || conn.type || ''
      if (type === 'wifi') return 'WiFi'
      if (type === 'ethernet') return '有线网络'
      if (type === 'cellular') return '4G 移动网络'
    }
    return 'WiFi'
  }

  /* ---------- 网速（后台并发） ---------- */
  private async getRealSpeed(): Promise<string> {
    // ① 先给临时值（可能 150 ms）
    const conn = (navigator as any).connection
    const temp = conn?.rtt ? `${conn.rtt} ms` : ''

    // ② 后台强制下载 → 更新为 Mbps
    const fileUrl =
      'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js?' + Date.now()
    const fileSize = 200 * 1024 * 8
    const start = performance.now()
    try {
      await fetch(fileUrl, { mode: 'no-cors', cache: 'no-store' })
      const duration = (performance.now() - start) / 1000
      const mbps = (fileSize / duration / 1024 / 1024).toFixed(1)
      return `${mbps} Mbps`
    } catch {
      // 下载失败 → 继续用临时值
      return temp
    }
  }

  /* ---------- 后台异步补充（真机/高熵值） ---------- */
  private async getRealModel(): Promise<string | undefined> {
    if ('userAgentData' in navigator) {
      try {
        const ud = (navigator as any).userAgentData
        const hv = await ud.getHighEntropyValues(['model'])
        if (hv.model) return hv.model.replace(/,/g, ' ')
      } catch {
        /* 高熵值失败 */
      }
    }
    // 无高熵值 → 返回 undefined，保留 UA 解析结果
    return undefined
  }

  private async getRealVersion(): Promise<string | undefined> {
    if ('userAgentData' in navigator) {
      try {
        const ud = (navigator as any).userAgentData
        if (ud.platform === 'Windows') {
          const major = Number(ud.platformVersion?.split('.')?.[0] ?? 0)
          if (major >= 11) return 'Windows 11'
          if (major >= 10) return 'Windows 10'
        }
      } catch {
        /* 高熵值失败 */
      }
    }
    return undefined
  }
}
