// packages/blog/server/api/admin/posts/index.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPostList } from '../../../utils/tagService'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Number(query.limit) || 10)
  const statusFilter =
    query.status === 'draft' || query.status === 'published' ? query.status : undefined
  const tagSlug = query.tag?.toString() || undefined

  try {
    const data = await getPostList({ page, limit, status: statusFilter, tagSlug })

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    throw createError({ statusCode: 500, message: '获取文章列表失败' })
  }
})
