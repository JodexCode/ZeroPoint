// packages/blog/server/utils/system/cpu.ts
import os from 'os'

let lastCpuMeasures: Array<{ idle: number; total: number }> | null = null
let lastCpuTime = 0

export function getInstantCpuUsage(): number {
  const now = Date.now()
  const currentMeasures = os.cpus().map(cpu => ({
    idle: cpu.times.idle,
    total: Object.values(cpu.times).reduce((a, b) => a + b, 0),
  }))

  if (!lastCpuMeasures || now - lastCpuTime < 100) {
    lastCpuMeasures = currentMeasures
    lastCpuTime = now
    return 0
  }

  const idleDiffs = currentMeasures.map((cur, i) => cur.idle - lastCpuMeasures![i].idle)
  const totalDiffs = currentMeasures.map((cur, i) => cur.total - lastCpuMeasures![i].total)

  const avgIdle = idleDiffs.reduce((a, b) => a + b, 0) / idleDiffs.length
  const avgTotal = totalDiffs.reduce((a, b) => a + b, 0) / totalDiffs.length

  const usage = avgTotal > 0 ? 1 - avgIdle / avgTotal : 0
  const percent = Math.max(0, Math.min(100, usage * 100))

  lastCpuMeasures = currentMeasures
  lastCpuTime = now

  return Math.round(percent * 10) / 10
}
