// packages/blog/server/api/admin/posts.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'
import { getPostList } from '../../utils/tagService' // 引入封装好的列表查询服务

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Number(query.limit) || 10)
  const statusFilter =
    query.status === 'draft' || query.status === 'published' ? query.status : undefined
  const tagSlug = query.tag?.toString() || undefined // 新增标签过滤参数

  try {
    // 调用封装好的列表查询服务
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
