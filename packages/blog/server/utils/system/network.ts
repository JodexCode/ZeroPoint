// packages/blog/server/utils/system/network.ts
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface NetworkStats {
  rxBytes: number
  txBytes: number
}

let lastNetworkStats: NetworkStats | null = null
let lastNetworkTime = 0

async function getRawNetworkStats(): Promise<NetworkStats> {
  const platform = os.platform()
  let rx = 0,
    tx = 0

  if (platform === 'win32') {
    try {
      const { stdout } = await execAsync('netstat -e', { timeout: 800 })
      const lines = stdout
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)

      // 查找包含至少两个大数字（> 10000）的行，且只有两列数字
      for (const line of lines) {
        const tokens = line.split(/\s+/).filter(t => t !== '')
        if (tokens.length === 3) {
          const num1 = Number(tokens[1])
          const num2 = Number(tokens[2])
          // 判断是否为有效的大整数（网络字节数通常很大）
          if (!isNaN(num1) && !isNaN(num2) && num1 > 10000 && num2 > 10000) {
            rx = num1
            tx = num2
            break
          }
        }
      }
    } catch (err) {
      console.warn('Failed to get Windows network stats via netstat -e:', err)
    }
  } else {
    try {
      if (platform === 'linux') {
        const { stdout } = await execAsync('cat /proc/net/dev', { timeout: 800 })
        const lines = stdout.split('\n').slice(2)
        for (const line of lines) {
          const parts = line.trim().split(/\s+/)
          if (parts.length < 10) continue
          const iface = parts[0].replace(':', '')
          if (iface === 'lo') continue
          rx += parseInt(parts[1]) || 0
          tx += parseInt(parts[9]) || 0
        }
      } else if (platform === 'darwin') {
        const { stdout } = await execAsync('netstat -ibn', { timeout: 800 })
        const lines = stdout.split('\n').slice(1)
        for (const line of lines) {
          const parts = line.trim().split(/\s+/)
          if (parts.length < 10 || parts[0] === 'lo0') continue
          const inBytes = parseInt(parts[6]) || 0
          const outBytes = parseInt(parts[9]) || 0
          rx += inBytes
          tx += outBytes
        }
      }
    } catch (err) {
      console.warn('Failed to get Unix network stats:', err)
    }
  }

  return { rxBytes: rx, txBytes: tx }
}

export async function getNetworkSpeed() {
  const now = Date.now()
  const current = await getRawNetworkStats()

  if (!lastNetworkStats) {
    lastNetworkStats = current
    lastNetworkTime = now
    return { rxBytes: current.rxBytes, txBytes: current.txBytes, rxSpeedKBps: 0, txSpeedKBps: 0 }
  }

  const timeDiffSec = (now - lastNetworkTime) / 1000
  if (timeDiffSec < 0.1) {
    return {
      rxBytes: current.rxBytes,
      txBytes: current.txBytes,
      rxSpeedKBps: 0,
      txSpeedKBps: 0,
    }
  }

  const rxDiff = Math.max(0, current.rxBytes - lastNetworkStats.rxBytes)
  const txDiff = Math.max(0, current.txBytes - lastNetworkStats.txBytes)

  const rxSpeedKBps = Math.round((rxDiff / timeDiffSec / 1024) * 10) / 10
  const txSpeedKBps = Math.round((txDiff / timeDiffSec / 1024) * 10) / 10

  lastNetworkStats = current
  lastNetworkTime = now

  return {
    rxBytes: current.rxBytes,
    txBytes: current.txBytes,
    rxSpeedKBps,
    txSpeedKBps,
  }
}

export function getNetworkInterfaces() {
  const nets = os.networkInterfaces()
  const result: Array<{ name: string; address: string; mac: string; internal: boolean }> = []

  for (const [name, netList] of Object.entries(nets)) {
    if (!netList) continue
    for (const net of netList) {
      if (net.family === 'IPv4') {
        result.push({
          name,
          address: net.address,
          mac: net.mac,
          internal: net.internal,
        })
      }
    }
  }

  return result
}
