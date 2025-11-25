import { defineEventHandler } from 'h3'
import { performance } from 'node:perf_hooks'
import { randomUUID } from 'node:crypto'

const isTTY = process.stdout.isTTY // 1. 自动开关颜色
const NO_LOG_PATHS = ['/api/test/ping'] // 2. 可过滤高频探活接口

const COLORS = {
  reset: isTTY ? '\x1b[0m' : '',
  green: isTTY ? '\x1b[32m' : '',
  yellow: isTTY ? '\x1b[33m' : '',
  red: isTTY ? '\x1b[31m' : '',
  gray: isTTY ? '\x1b[90m' : '',
  cyan: isTTY ? '\x1b[36m' : '',
  blue: isTTY ? '\x1b[34m' : '',
}

function colorize(status: number) {
  if (status < 400) return COLORS.green
  if (status < 500) return COLORS.yellow
  return COLORS.red
}

function methodColor(method: string) {
  const map: Record<string, string> = {
    GET: COLORS.cyan,
    POST: COLORS.green,
    PUT: COLORS.blue,
    DELETE: COLORS.red,
    PATCH: COLORS.yellow,
  }
  return map[method] || COLORS.gray
}

function pad(str: string, len: number) {
  return (str + ' '.repeat(len)).slice(0, len)
}

export default defineEventHandler(event => {
  const url = event.node.req.url ?? '/'
  if (NO_LOG_PATHS.includes(url.split('?')[0])) return // 高频接口静默

  const start = performance.now()
  const method = event.node.req.method ?? 'UNKNOWN'
  const reqId = randomUUID().slice(-6) // 3. 短请求ID
  event.context.reqId = reqId // 供下游中间件/接口使用

  // 4. 监听 finish 再打印
  event.node.res.on('finish', () => {
    const cost = Math.round(performance.now() - start)
    const status = event.node.res.statusCode
    const log =
      `[${new Date().toLocaleString('zh-CN', { hour12: false })}]` +
      ` ${colorize(status)}${pad(status.toString(), 3)}${COLORS.reset}` +
      ` ${methodColor(method)}${pad(method, 6)}${COLORS.reset}` +
      ` [${reqId}] ` + // 请求ID
      `${pad(url.split('?')[0], 25)} ` +
      `${COLORS.gray}${cost}ms${COLORS.reset}`

    console.log(log)
  })
})
