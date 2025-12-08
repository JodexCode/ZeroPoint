// packages\blog\server\middleware\auth.ts
import { defineEventHandler, getCookie, createError, getRequestURL } from 'h3'
import { sessionStore } from '../utils/sessionStore'
import type { AdminSessionData } from '../types/session'

declare module 'h3' {
  interface H3EventContext {
    admin?: AdminSessionData
  }
}

/* 1. 仅这些接口需要登录，其余一律放行 */
const adminOnly = new Set(['/api/admin/*', '/api/me/*', '/api/system/*'])

/* 2. 通配匹配函数 */
function isAdminRoute(url: string): boolean {
  // 完全相等 or 段通配
  if (adminOnly.has(url)) return true
  for (const p of adminOnly) {
    if (p.endsWith('/*') && url.startsWith(p.slice(0, -2))) return true
  }
  return false
}

/* 3. 中间件：只鉴权已声明接口 */
export default defineEventHandler(async event => {
  const url = getRequestURL(event).pathname

  /* 4. 不在清单 → 直接放行 */
  if (!isAdminRoute(url)) return

  /* 5. 在清单 → 必须登录 */
  const token = getCookie(event, 'session_token')
  if (!token) throw createError({ statusCode: 401, message: '未提供会话凭证' })
  const session = await sessionStore.get(token)
  if (!session) throw createError({ statusCode: 401, message: '会话无效或已过期' })
  event.context.admin = session
})
