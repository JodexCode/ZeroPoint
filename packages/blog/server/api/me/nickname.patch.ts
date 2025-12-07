// packages/blog/server/api/me/nickname.patch.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { query } from '../../utils/db' // ← 正确导入原生 query

const schema = z.object({
  nickname: z.string().trim().min(1, '昵称不能为空').max(20, '昵称最长 20 字符'),
})

export default defineEventHandler(async event => {
  const adminSession = event.context.admin!
  const body = await readBody(event)
  const { nickname } = schema.parse(body)

  // 执行更新
  const result = await query(`UPDATE admins SET nickname = $1 WHERE id = $2`, [
    nickname,
    adminSession.adminId,
  ])

  // 检查是否更新成功（rowCount 表示受影响行数）
  if (result.rowCount === 0) {
    throw createError({ statusCode: 404, message: '账户不存在' })
  }

  return { success: true, message: '昵称已更新' }
})
