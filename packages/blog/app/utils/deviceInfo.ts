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
      networkType: this.getNetworkType(), // 同步
      networkSpeed: await this.getNetworkSpeed(), // 异步但 <20ms
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
    if (/iPhone|iPad/i.test(ua)) {
      const m = ua.match(/\((iPhone[^;)]+|iPad[^;)]+)\)/)
      return m?.[1] ?? 'iOS Device'
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

    /* ① UA-CH（Chrome/Edge） */
    if ('userAgentData' in navigator) {
      const ud = (navigator as any).userAgentData
      if (ud && ud.platform === 'Windows') {
        // 先尝试拿高熵值
        try {
          const hv = await ud.getHighEntropyValues(['platformVersion'])
          const major = Number(hv.platformVersion?.split('.')?.[0] ?? 0)
          if (major >= 11) return 'Windows 11'
          if (major >= 10) return 'Windows 10'
        } catch (e) {
          console.log('[DBG] UA-CH 高熵失败', e)
        }
      }
    } else {
      console.log('[DBG] 无 UA-CH，走 UA 兜底')
    }

    /* ② UA 兜底（Firefox & Chrome 无高熵） */
    if (/Windows/i.test(ua)) {
      if (/Windows NT 10\.0/i.test(ua)) {
        // 捕捉任意 ≥22000 的 5 位数字
        const buildMatch = ua.match(/Windows NT 10\.0.+?(\d{5,})/)
        const build = Number(buildMatch?.[1] || 0)
        console.log('[DBG] UA 兜底 build:', build)
        return build >= 22000 ? 'Windows 11' : 'Windows 10'
      }
      if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1'
      if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7'
      return 'Windows'
    }

    /* 其余平台略... */
    return 'Unknown System'
  }

  /* ---------- 网络类型（UA 级，Firefox 可用） ---------- */
  private getNetworkType(): string {
    const ua = navigator.userAgent
    // 1. 优先 UA 关键词
    if (ua.includes('Mobile')) return '移动网络'
    if (ua.includes('Android') || ua.includes('iPhone') || ua.includes('iPad')) return '移动网络'
    // 2. 如支持 connection API 再细分
    const conn = (navigator as any).connection
    if (conn) {
      const type = conn.networkType || conn.type || ''
      if (type === 'wifi') return 'WiFi'
      if (type === 'ethernet') return '有线网络'
      if (type === 'cellular') return '4G 移动网络'
    }
    // 3. 兜底
    return 'WiFi'
  }

  /* ---------- 网速（强制下载测速，不用 downlink） ---------- */
  private async getNetworkSpeed(): Promise<string> {
    // 统一 200KB 国内文件，带随机数防缓存
    const fileUrl =
      'https://cdn.bootcdn.net/ajax/libs/lodash.js/4.17.21/lodash.min.js?' + Date.now()
    const fileSize = 200 * 1024 * 8 // bit
    const start = performance.now()

    try {
      await fetch(fileUrl, { mode: 'no-cors', cache: 'no-store' })
      const duration = (performance.now() - start) / 1000 // 秒
      const mbps = (fileSize / duration / 1024 / 1024).toFixed(1)
      return `${mbps} Mbps`
    } catch {
      // 极端失败：退用 RTT
      const conn = (navigator as any).connection
      return conn?.rtt ? `${conn.rtt} ms` : ''
    }
  }
}
