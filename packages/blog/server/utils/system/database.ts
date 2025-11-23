// packages/blog/server/utils/system/database.ts

import getDb from '../db'
import getRedisClient from '../redis'

export async function checkDatabaseHealth() {
  const result = {
    postgresql: {
      connected: false,
      version: null as string | null,
      connections: null as number | null,
      maxConnections: null as number | null, // 👈 新增
      uptimeSeconds: null as number | null,
      error: null as string | null,
    },
    redis: {
      connected: false,
      version: null as string | null,
      usedMemoryMB: null as number | null,
      connectedClients: null as number | null,
      maxClients: null as number | null, // 👈 新增
      uptimeSeconds: null as number | null,
      error: null as string | null,
    },
  }

  try {
    const db = await getDb()
    // 并行查询：版本、当前连接/uptime、最大连接数
    const [versionRow, statRow, maxConnRow] = await Promise.all([
      db.raw('SELECT version()'),
      db.raw(`
        SELECT
          numbackends AS connections,
          EXTRACT(EPOCH FROM (NOW() - pg_postmaster_start_time())) AS uptime_seconds
        FROM pg_stat_database
        WHERE datname = current_database()
        LIMIT 1
      `),
      db.raw(`SELECT setting::int FROM pg_settings WHERE name = 'max_connections'`), // 👈 关键查询
    ])

    result.postgresql.connected = true
    result.postgresql.version = (versionRow.rows[0]?.version as string)?.split(' ')[1] || null
    result.postgresql.connections = statRow.rows[0]?.connections || 0
    result.postgresql.maxConnections = maxConnRow.rows[0]?.setting || 100 // 默认 100
    result.postgresql.uptimeSeconds = Math.round(statRow.rows[0]?.uptime_seconds || 0)
  } catch (err: any) {
    result.postgresql.error = err.message || 'Unknown PostgreSQL error'
  }

  try {
    const client = await getRedisClient()
    // 同时获取 info 和 config（注意：部分环境可能禁用 CONFIG）
    const [info, config] = await Promise.all([
      client.info('all'),
      (async () => {
        try {
          const res = await client.configGet('maxclients')
          return res?.[1] || '10000' // configGet 返回 ['maxclients', '10000']
        } catch {
          console.warn('Redis CONFIG GET disabled, using default maxclients=10000')
          return '10000'
        }
      })(),
    ])

    const lines = info.split('\r\n')
    const map: Record<string, string> = {}
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':', 2)
        map[key] = value
      }
    }

    result.redis.connected = true
    result.redis.version = map.redis_version || null
    result.redis.usedMemoryMB = map.used_memory
      ? Math.round((parseInt(map.used_memory) / (1024 * 1024)) * 10) / 10
      : null
    result.redis.connectedClients = map.connected_clients ? parseInt(map.connected_clients) : null
    result.redis.maxClients = parseInt(config) // 👈 使用查询到的值
    result.redis.uptimeSeconds = map.uptime_in_seconds ? parseInt(map.uptime_in_seconds) : null
  } catch (err: any) {
    result.redis.error = err.message || 'Unknown Redis error'
  }

  return result
}
