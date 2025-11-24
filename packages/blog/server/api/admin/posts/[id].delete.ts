// packages/blog/server/api/admin/posts/[id].delete.ts
import { defineEventHandler, createError } from 'h3'
import getDb from '../../../utils/db'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const db = await getDb()

  const result = await db('posts').where({ id }).del()
  if (result === 0) {
    throw createError({ statusCode: 404, message: '文章不存在或已被删除' })
  }

  return {
    success: true,
    message: '文章已删除',
  }
})
