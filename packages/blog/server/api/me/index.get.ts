// packages/blog/server/api/me/index.get.ts
import { defineEventHandler, getCookie, createError } from 'h3'
import getDb from '../../utils/db' // 👈 新增导入
import { sessionStore } from '../../utils/sessionStore'

export default defineEventHandler(async event => {
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const session = await sessionStore.get(token)
  if (!session) {
    throw createError({ statusCode: 401, message: '会话已过期' })
  }

  // 👇 从数据库查询完整管理员信息（含 nickname, avatar_url）
  const db = await getDb()
  const admin = await db('admins')
    .where({ id: session.adminId })
    .select('username', 'nickname', 'avatar_url')
    .first()

  if (!admin) {
    throw createError({ statusCode: 404, message: '管理员账户不存在' })
  }

  return {
    success: true,
    data: {
      adminId: session.adminId,
      username: admin.username,
      nickname: admin.nickname || admin.username, // 回退到 username
      avatarUrl: admin.avatar_url || null, // 明确返回 null（前端可判断）
    },
  }
})
