// packages/blog/server/api/me/index.get.ts
import { defineEventHandler, createError } from 'h3'
import { query } from '../../utils/db' // ← 正确导入原生 query

export default defineEventHandler(async event => {
  const adminSession = event.context.admin! // 已由中间件保证非空

  // 查询当前管理员信息
  const res = await query(
    `SELECT username, nickname, avatar_url
     FROM admins
     WHERE id = $1`,
    [adminSession.adminId]
  )

  const admin = res.rows[0]

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
