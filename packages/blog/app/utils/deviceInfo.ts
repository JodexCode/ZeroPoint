// packages/blog/app/utils/deviceInfo.ts
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

    return {
      deviceModel: await this.getDeviceModel(),
      systemVersion: await this.getSystemVersion(),
      networkType: this.getNetworkType(),
      networkSpeed: await this.getNetworkSpeed(),
    }
  }

  /* ---------- 型号 ---------- */
  private async getDeviceModel(): Promise<string> {
    const ua = navigator.userAgent
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
    /* ---------- iOS / iPadOS 型号（ ---------- */
    if (/iPhone|iPad/i.test(ua)) {
      // ① 优先问浏览器拿具体型号
      if ('userAgentData' in navigator) {
        try {
          const ud = (navigator as any).userAgentData
          const hv = await ud.getHighEntropyValues(['model'])
          if (hv.model) return hv.model.replace(/,/g, ' ')
        } catch {
          /* 高熵值失败 */
        }
      }
      // ② UA 里抓具体型号
      const m = ua.match(/\((iPhone[^;)]+|iPad[^;)]+)\)/)
      if (m?.[1]) return m[1].replace(/;/g, '')
      // ③ 兜底
      return /iPad/i.test(ua) ? 'iPad' : 'iPhone'
    }
    if (/Windows/i.test(ua)) return 'Windows PC'
    if (/Mac/i.test(ua)) {
      const m = ua.match(/Mac OS X ([\d_.]+)/)
      return m?.[1] ? `macOS ${m[1].replace(/_/g, '.')}` : 'Mac Device'
    }
    return 'Unknown Device'
  }

  /* ---------- 系统版本 ---------- */
  private async getSystemVersion(): Promise<string> {
    const ua = navigator.userAgent

    /* ===== iOS / iPadOS ===== */
    if (/iPhone|iPad/i.test(ua)) {
      const v = ua.match(/OS (\d+[_.]\d+)/)
      return v?.[1] ? `iOS ${v[1].replace(/_/g, '.')}` : 'iOS'
    }

    /* ===== macOS ===== */
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

    /* ===== Windows ===== */
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

    /* ===== Android ===== */
    if (/Android/i.test(ua)) {
      const m = ua.match(/Android (\d+\.\d+)/)
      return m?.[1] ? `Android ${m[1]}` : 'Android'
    }

    return 'Unknown System'
  }

  /* ---------- 网络类型 ---------- */
  private getNetworkType(): string {
    const ua = navigator.userAgent
    if (ua.includes('Mobile')) return '移动网络'
    if (ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPad')) return '移动网络'
    const conn = (navigator as any).connection
    if (conn) {
      const type = conn.networkType || conn.type || ''
      if (type === 'wifi') return 'WiFi'
      if (type === 'ethernet') return '有线网络'
      if (type === 'cellular') return '4G 移动网络'
    }
    return 'WiFi'
  }

  /* ---------- 网速（真实 Mbps） ---------- */
  private async getNetworkSpeed(): Promise<string> {
    const conn = (navigator as any).connection
    if (conn?.rtt) return `${conn.rtt} ms`

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
      return conn?.rtt ? `${conn.rtt} ms` : ''
    }
  }
}
