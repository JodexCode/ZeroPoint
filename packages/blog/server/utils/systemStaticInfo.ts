// packages/blog/server/utils/systemStaticInfo.ts
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import iconv from 'iconv-lite'

const execAsync = promisify(exec)

// 👇 明确定义静态信息的数据结构
export interface SystemStaticInfo {
  os: {
    platform: NodeJS.Platform
    type: string
    family: string
    release: string
    version: string | null // Windows
    distro: string | null // Linux
    arch: string
    hostname: string
  }
  cpu: {
    cores: number
    model: string
  }
}

async function getWindowsVersion(): Promise<string | null> {
  if (os.platform() !== 'win32') return null
  try {
    const { stdout } = await execAsync('wmic os get Caption /value', {
      timeout: 1000,
      encoding: 'buffer',
      windowsHide: true,
    })
    const text = iconv.decode(stdout, 'cp936')
    const match = text.match(/Caption=(.+)/)
    return match ? match[1].trim() : null
  } catch {
    return null
  }
}

async function getLinuxDistro(): Promise<string | null> {
  if (os.platform() !== 'linux') return null
  try {
    const { stdout } = await execAsync('cat /etc/os-release', { timeout: 500 })
    const match = stdout.match(/PRETTY_NAME="([^"]+)"/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

function getArch(): string {
  const arch = os.arch()
  if (arch === 'x64') return 'x64'
  if (arch === 'arm64') return 'arm64'
  if (arch === 'ia32') return 'x86'
  return arch
}

// 👇 缓存的是解析后的值，不是 Promise！
let _staticInfo: SystemStaticInfo | null = null

async function buildStaticInfo(): Promise<SystemStaticInfo> {
  const platform = os.platform()
  const type = os.type()

  let family: string
  if (type === 'Windows_NT') family = 'Windows'
  else if (type === 'Darwin') family = 'macOS'
  else family = type

  const [windowsVersion, linuxDistro] = await Promise.all([getWindowsVersion(), getLinuxDistro()])

  return {
    os: {
      platform,
      type,
      family,
      release: os.release(),
      version: windowsVersion,
      distro: linuxDistro,
      arch: getArch(),
      hostname: os.hostname(),
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown',
    },
  }
}

export async function getSystemStaticInfo(): Promise<SystemStaticInfo> {
  if (!_staticInfo) {
    _staticInfo = await buildStaticInfo()
  }
  return _staticInfo
}
