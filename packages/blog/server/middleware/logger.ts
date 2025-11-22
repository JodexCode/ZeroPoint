// server/middleware/logger.ts
import { defineEventHandler } from 'h3'
import { performance } from 'node:perf_hooks'

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  purple: '\x1b[35m',
}

function colorize(status: number) {
  if (status >= 200 && status < 300) return COLORS.green
  if (status >= 400 && status < 500) return COLORS.yellow
  if (status >= 500) return COLORS.red
  return COLORS.gray
}

function methodColor(method: string) {
  const colors: Record<string, string> = {
    GET: COLORS.cyan,
    POST: COLORS.green,
    PUT: COLORS.blue,
    DELETE: COLORS.red,
    PATCH: COLORS.purple,
  }
  return colors[method] || COLORS.gray
}

function pad(str: string, len: number) {
  return (str + ' '.repeat(len)).substring(0, len)
}

export default defineEventHandler(event => {
  const start = performance.now()
  const url = event.node.req.url || '/'
  const method = event.node.req.method || 'UNKNOWN'

  // 监听响应结束
  event.node.res.on('finish', () => {
    const duration = Math.round(performance.now() - start)
    const statusCode = event.node.res.statusCode
    const color = colorize(statusCode)
    const methodClr = methodColor(method)

    const timestamp = new Date()
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-')

    const logLine =
      `[${timestamp}] ` +
      `${color}${pad(statusCode.toString(), 3)}${COLORS.reset} ` +
      `${methodClr}${pad(method, 6)}${COLORS.reset} ` +
      `${pad(url.split('?')[0], 25)} ` +
      `${COLORS.gray}${duration}ms${COLORS.reset}`

    console.log(logLine)
  })
})
