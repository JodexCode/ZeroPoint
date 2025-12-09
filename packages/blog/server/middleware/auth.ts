// packages/blog/server/middleware/auth.ts
import { defineEventHandler, getCookie, createError } from 'h3'
import { sessionStore } from '../utils/sessionStore'
import type { AdminSessionData } from '../types/session'

declare module 'h3' {
  interface H3EventContext {
    admin?: AdminSessionData
  }
}

/* 1. 需要登录的接口（h3 原生通配符 ** 匹配多级） */
const adminRoutes = ['/api/admin/**', '/api/me/**', '/api/system/**']

export default defineEventHandler(async event => {
  /* 2. 只拦截声明的通配路径，其余直接放行 */
  if (!adminRoutes.some(pattern => event.node.req.url?.startsWith(pattern.replace('/**', '')))) {
    return
  }

  /* 3. 必须携带 session */
  const token = getCookie(event, 'session_token')
  if (!token) throw createError({ statusCode: 401, message: '未提供会话凭证' })
  const session = await sessionStore.get(token)
  if (!session) throw createError({ statusCode: 401, message: '会话无效或已过期' })
  event.context.admin = session
})
