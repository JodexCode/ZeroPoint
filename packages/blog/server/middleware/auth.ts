// packages/blog/server/middleware/auth.ts
import { defineEventHandler, getCookie, createError, getRequestURL } from 'h3'
import { sessionStore } from '../utils/sessionStore'
import type { AdminSessionData } from '../types/session'

declare module 'h3' {
  interface H3EventContext {
    admin?: AdminSessionData
  }
}

const publicPaths = [
  '/api/login',
  '/api/logout',
  '/api/test/ping', // ✅ 公开健康检查
  // '/api/test/session' ← 不放行！因为它需要登录
  '/',
  '/blog',
  '/projects',
]

export default defineEventHandler(async event => {
  const url = getRequestURL(event).pathname

  // 跳过不需要认证的公开接口
  if (publicPaths.includes(url)) {
    return
  }

  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    throw createError({ statusCode: 401, message: '未提供会话凭证' })
  }

  const session = await sessionStore.get(sessionToken)
  if (!session) {
    throw createError({ statusCode: 401, message: '会话无效或已过期' })
  }

  event.context.admin = session
})
