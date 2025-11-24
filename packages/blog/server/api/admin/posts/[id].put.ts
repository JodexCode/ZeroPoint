// packages/blog/server/api/admin/posts/[id].put.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { PostUpdateSchema } from '../../../schemas/post'
import getDb from '../../../utils/db'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const body = await readBody(event)

  // Zod 校验
  let input
  try {
    input = PostUpdateSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: '参数验证失败',
        data: error.issues.map(issue => issue.message),
      })
    }
    throw error
  }

  const db = await getDb()

  const existing = await db('posts').where({ id }).first('id')
  if (!existing) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  try {
    const [updated] = await db('posts')
      .where({ id })
      .update({
        title: input.title,
        content: input.content,
        excerpt: input.excerpt || null,
        cover_image: input.coverImage || null,
        status: input.status,
        tags: input.tags || [],
        updated_at: db.fn.now(),
      })
      .returning('*')

    return {
      success: true,
      data: updated,
    }
  } catch (error: any) {
    console.error('更新文章失败:', error)
    throw createError({ statusCode: 500, message: '更新文章失败' })
  }
})
