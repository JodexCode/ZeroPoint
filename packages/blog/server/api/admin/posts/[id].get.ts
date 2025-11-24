// packages/blog/server/api/admin/posts/[id].get.ts
import { defineEventHandler, createError } from 'h3'
import getDb from '../../../utils/db'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const db = await getDb()
  const post = await db('posts').where({ id }).first()

  if (!post) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  return {
    success: true,
    data: post,
  }
})
