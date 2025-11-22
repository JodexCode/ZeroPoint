// server/api/test/session.get.ts
import { defineEventHandler, getCookie, createError } from 'h3'
import { sessionStore } from '../../utils/sessionStore'

export default defineEventHandler(async event => {
  // 仅允许在 development 环境访问
  if (process.env.NODE_ENV !== 'development') {
    throw createError({
      statusCode: 404,
      message: 'Not Found',
    })
  }

  // 1. 从 Cookie 获取 session token
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    throw createError({
      statusCode: 401,
      message: '未提供会话凭证',
    })
  }

  // 2. 查询 Redis 中的 session
  const session = await sessionStore.get(sessionToken)
  if (!session) {
    throw createError({
      statusCode: 401,
      message: '会话已过期或无效',
    })
  }

  // 3. 返回当前会话信息（不暴露敏感数据）
  return {
    success: true,
    message: '会话有效',
    data: {
      adminId: session.adminId,
      username: session.username,
      createdAt: new Date(session.createdAt).toISOString(),
    },
  }
})
