// packages/blog/server/middleware/auth.ts
import { defineEventHandler, getCookie, createError } from 'h3'
import { sessionStore } from '../utils/sessionStore'
import type { AdminSessionData } from '../types/session'

declare module 'h3' {
  interface H3EventContext {
    admin?: AdminSessionData
  }
}

/* 需要登录的接口 */
const adminRoutes = ['/api/admin/**', '/api/me/**', '/api/system/**']

export default defineEventHandler(async event => {
  if (!adminRoutes.some(pattern => event.node.req.url?.startsWith(pattern.replace('/**', '')))) {
    return
  }

  const token = getCookie(event, 'session_token')
  if (!token) throw createError({ statusCode: 401, message: '未提供会话凭证' })
  const session = await sessionStore.get(token)
  if (!session) throw createError({ statusCode: 401, message: '会话无效或已过期' })
  event.context.admin = session
})
