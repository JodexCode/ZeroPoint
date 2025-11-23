// packages/blog/server/utils/system/metricsSimplify.ts

export function simplifyMetric(snapshot: any) {
  return {
    ts: snapshot.timestamp,
    cpu: snapshot.cpu.usagePercent,
    mem: snapshot.memory.usagePercent,
    rx: snapshot.network.total.rxSpeedKBps,
    tx: snapshot.network.total.txSpeedKBps,
  }
}
