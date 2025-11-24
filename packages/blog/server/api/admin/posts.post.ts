// packages/blog/server/api/admin/posts.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { PostCreateSchema } from '../../schemas/post'
import getDb from '../../utils/db'
import { slugify } from '../../utils/slugify'

export default defineEventHandler(async event => {
  const body = await readBody(event)

  // Zod 校验
  let input
  try {
    input = PostCreateSchema.parse(body)
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

  // 生成唯一 slug（最多重试5次）
  let slug = slugify(input.title)
  let exists
  let attempts = 0
  do {
    exists = await db('posts').where({ slug }).first('id')
    if (exists) {
      slug = slugify(input.title)
      attempts++
      if (attempts >= 5) {
        throw createError({ statusCode: 500, message: '无法生成唯一文章链接，请稍后重试' })
      }
    }
  } while (exists)

  try {
    const [post] = await db('posts')
      .insert({
        title: input.title,
        slug,
        content: input.content,
        excerpt: input.excerpt || null,
        cover_image: input.coverImage || null,
        status: input.status,
        tags: input.tags || [],
        views: 0,
      })
      .returning('*')

    return {
      success: true,
      data: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        status: post.status,
        createdAt: post.created_at,
      },
    }
  } catch (error: any) {
    console.error('创建文章失败:', error)
    if (error.code === '23505' && error.constraint?.includes('posts_slug_unique')) {
      throw createError({ statusCode: 409, message: '文章链接冲突，请重试' })
    }
    throw createError({ statusCode: 500, message: '创建文章失败' })
  }
})
