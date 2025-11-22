// packages/blog/server/api/logout.post.ts
import { defineEventHandler, getCookie, setCookie } from 'h3'
import { sessionStore } from '../utils/sessionStore'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'session_token')

  if (token) {
    // 从 store 中删除 session
    await sessionStore.delete(token)

    // 清除 Cookie（设为空并过期）
    setCookie(event, 'session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // 立即过期
      path: '/',
    })
  }

  return { success: true, message: 'Logged out' }
})
