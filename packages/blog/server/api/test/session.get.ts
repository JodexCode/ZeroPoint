// server/api/test/session.get.ts
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async event => {
  if (process.env.NODE_ENV !== 'development') {
    throw createError({ statusCode: 404, message: 'Not Found' })
  }

  const session = event.context.admin! // ✅ 由 auth 中间件保证存在

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
