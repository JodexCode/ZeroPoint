// packages/blog/server/api/me/index.get.ts
import { defineEventHandler } from 'h3'
import getDb from '../../utils/db'

export default defineEventHandler(async event => {
  const adminSession = event.context.admin! // 已由中间件保证非空

  const db = await getDb()
  const admin = await db('admins')
    .where({ id: adminSession.adminId })
    .select('username', 'nickname', 'avatar_url')
    .first()

  if (!admin) {
    // 理论上不会发生，除非管理员被物理删除
    throw createError({ statusCode: 404, message: '管理员账户不存在' })
  }

  return {
    success: true,
    data: {
      adminId: adminSession.adminId,
      username: admin.username,
      nickname: admin.nickname || admin.username,
      avatarUrl: admin.avatar_url || null,
    },
  }
})
