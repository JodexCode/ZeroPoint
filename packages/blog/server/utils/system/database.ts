// packages/blog/server/utils/system/database.ts

import { query } from '../db' // ← 原生 pg query
import getRedisClient from '../redis'

export async function checkDatabaseHealth() {
  const result = {
    postgresql: {
      connected: false,
      version: null as string | null,
      connections: null as number | null,
      maxConnections: null as number | null,
      uptimeSeconds: null as number | null,
      error: null as string | null,
    },
    redis: {
      connected: false,
      version: null as string | null,
      usedMemoryMB: null as number | null,
      connectedClients: null as number | null,
      maxClients: null as number | null,
      uptimeSeconds: null as number | null,
      error: null as string | null,
    },
  }

  // --- PostgreSQL ---
  try {
    // 并行执行三个查询
    const [versionRes, statRes, maxConnRes] = await Promise.all([
      query('SELECT version()'),
      query(`
        SELECT
          numbackends AS connections,
          EXTRACT(EPOCH FROM (NOW() - pg_postmaster_start_time())) AS uptime_seconds
        FROM pg_stat_database
        WHERE datname = current_database()
        LIMIT 1
      `),
      query(`SELECT setting::int FROM pg_settings WHERE name = 'max_connections'`),
    ])

    result.postgresql.connected = true
    result.postgresql.version = (versionRes.rows[0]?.version as string)?.split(' ')[1] || null
    result.postgresql.connections = statRes.rows[0]?.connections || 0
    result.postgresql.maxConnections = maxConnRes.rows[0]?.setting || 100
    result.postgresql.uptimeSeconds = Math.round(statRes.rows[0]?.uptime_seconds || 0)
  } catch (err: any) {
    result.postgresql.error = err.message || 'Unknown PostgreSQL error'
  }

  // --- Redis ---
  try {
    const client = await getRedisClient()

    const [info, config] = await Promise.all([
      client.info('all'),
      (async () => {
        try {
          // ioredis / redis@4+ 返回数组 ['maxclients', '10000']
          const res = await client.configGet('maxclients')
          return res?.[1] || '10000'
        } catch {
          console.warn('Redis CONFIG GET disabled, using default maxclients=10000')
          return '10000'
        }
      })(),
    ])

    const lines = info.split(/\r?\n/)
    const map: Record<string, string> = {}
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2)
        if (key && value !== undefined) map[key] = value
      }
    }

    result.redis.connected = true
    result.redis.version = map.redis_version || null
    result.redis.usedMemoryMB = map.used_memory
      ? Math.round((parseInt(map.used_memory) / (1024 * 1024)) * 10) / 10
      : null
    result.redis.connectedClients = map.connected_clients ? parseInt(map.connected_clients) : null
    result.redis.maxClients = parseInt(config)
    result.redis.uptimeSeconds = map.uptime_in_seconds ? parseInt(map.uptime_in_seconds) : null
  } catch (err: any) {
    result.redis.error = err.message || 'Unknown Redis error'
  }

  return result
}
