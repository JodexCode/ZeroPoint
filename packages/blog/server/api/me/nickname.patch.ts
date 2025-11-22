import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { z } from 'zod'
import getDb from '../../utils/db'
import { sessionStore } from '../../utils/sessionStore'

const schema = z.object({
  nickname: z.string().trim().min(1, '昵称不能为空').max(20, '昵称最长 20 字符'),
})

export default defineEventHandler(async event => {
  const token = getCookie(event, 'session_token')
  if (!token) throw createError({ statusCode: 401, message: '未登录' })

  const session = await sessionStore.get(token)
  if (!session?.adminId) throw createError({ statusCode: 401, message: '无效会话' })

  const body = await readBody(event)
  const { nickname } = schema.parse(body)

  const db = await getDb()
  const updated = await db('admins').where({ id: session.adminId }).update({ nickname })

  if (!updated) throw createError({ statusCode: 404, message: '账户不存在' })

  return { success: true, message: '昵称已更新' }
})
