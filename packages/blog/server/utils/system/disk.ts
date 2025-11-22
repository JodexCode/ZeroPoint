// packages/blog/server/utils/system/disk.ts
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import iconv from 'iconv-lite'

const execAsync = promisify(exec)

let diskCache: any[] | null = null
let diskCacheTime = 0
const DISK_CACHE_TTL = 30_000 // 30 seconds

async function _fetchDisksActual() {
  const platform = os.platform()
  if (platform === 'win32') {
    const { stdout } = await execAsync(
      'wmic logicaldisk where "DriveType=3" get DeviceID,FileSystem,Size,FreeSpace /format:csv',
      { timeout: 1200, encoding: 'buffer', windowsHide: true }
    )

    let text: string
    try {
      text = iconv.decode(stdout, 'cp936')
    } catch {
      text = stdout.toString('utf8')
    }

    text = text.replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n')
    const lines = text
      .trim()
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)

    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const deviceIndex = headers.indexOf('DeviceID')
    const fsIndex = headers.indexOf('FileSystem')
    const sizeIndex = headers.indexOf('Size')
    const freeIndex = headers.indexOf('FreeSpace')

    if (deviceIndex === -1 || sizeIndex === -1) return []

    const result = []
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim())
      const deviceID = parts[deviceIndex]
      if (!deviceID || !/^[A-Z]:$/.test(deviceID)) continue

      const fileSystem = parts[fsIndex] || 'unknown'
      const sizeStr = parts[sizeIndex] || ''
      const freeSpaceStr = parts[freeIndex] || ''

      const totalBytes = sizeStr ? Number(sizeStr) : NaN
      const freeBytes = freeSpaceStr ? Number(freeSpaceStr) : NaN

      if (isNaN(totalBytes) || isNaN(freeBytes) || totalBytes <= 0) continue

      const totalGB = Math.round(totalBytes / 1024 ** 3)
      const freeGB = Math.round(freeBytes / 1024 ** 3)
      const usedGB = totalGB - freeGB
      if (usedGB < 0) continue

      const usagePercent = totalGB > 0 ? Math.round((usedGB / totalGB) * 1000) / 10 : 0

      result.push({
        mount: `${deviceID}\\`,
        filesystem: fileSystem,
        totalGB,
        usedGB,
        freeGB,
        usagePercent,
      })
    }

    return result
  } else {
    const { stdout } = await execAsync('df -kP', { timeout: 1000 })
    const lines = stdout.trim().split('\n').slice(1)
    const result = lines
      .map(line => {
        const parts = line.split(/\s+/)
        if (parts.length < 6) return null
        const filesystem = parts[0]
        const totalKB = parseInt(parts[1]) || 0
        const usedKB = parseInt(parts[2]) || 0
        const freeKB = parseInt(parts[3]) || 0
        const mount = parts[5]

        if (!filesystem.startsWith('/dev/')) return null

        const totalGB = Math.round(totalKB / 1024 ** 2)
        const usedGB = Math.round(usedKB / 1024 ** 2)
        const freeGB = Math.round(freeKB / 1024 ** 2)
        const usagePercent = totalGB > 0 ? Math.round((usedGB / totalGB) * 1000) / 10 : 0

        return { mount, filesystem, totalGB, usedGB, freeGB, usagePercent }
      })
      .filter(Boolean)

    return result as any[]
  }
}

export async function getDisks(): Promise<
  Array<{
    mount: string
    filesystem: string
    totalGB: number
    usedGB: number
    freeGB: number
    usagePercent: number
  }>
> {
  const now = Date.now()
  if (diskCache && now - diskCacheTime < DISK_CACHE_TTL) {
    return [...diskCache]
  }

  if (diskCache) {
    _fetchDisksActual()
      .then(result => {
        diskCache = result
        diskCacheTime = Date.now()
      })
      .catch(err => console.warn('Disk cache refresh failed:', err))
    return [...diskCache]
  }

  const result = await _fetchDisksActual()
  diskCache = result
  diskCacheTime = Date.now()
  return result
}
