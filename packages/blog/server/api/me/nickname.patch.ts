// packages/blog/server/api/me/nickname.patch.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import getDb from '../../utils/db'

const schema = z.object({
  nickname: z.string().trim().min(1, '昵称不能为空').max(20, '昵称最长 20 字符'),
})

export default defineEventHandler(async event => {
  const adminSession = event.context.admin!
  const body = await readBody(event)
  const { nickname } = schema.parse(body)

  const db = await getDb()
  const updated = await db('admins').where({ id: adminSession.adminId }).update({ nickname })

  if (!updated) {
    throw createError({ statusCode: 404, message: '账户不存在' })
  }

  return { success: true, message: '昵称已更新' }
})
