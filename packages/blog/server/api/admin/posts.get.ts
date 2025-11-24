// packages/blog/server/api/admin/posts.get.ts
import { defineEventHandler, getQuery, createError } from 'h3'
import getDb from '../../utils/db'

export default defineEventHandler(async event => {
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Number(query.limit) || 10)
  const offset = (page - 1) * limit

  const statusFilter =
    query.status === 'draft' || query.status === 'published' ? query.status : undefined

  try {
    const db = await getDb()

    let countQuery = db('posts').count({ count: '*' })
    if (statusFilter) countQuery = countQuery.where({ status: statusFilter })
    const [{ count }] = await countQuery

    let listQuery = db('posts')
      .select(
        'id',
        'title',
        'slug',
        'status',
        'views',
        'created_at',
        'updated_at',
        'tags',
        'excerpt'
      )
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset)

    if (statusFilter) listQuery = listQuery.where({ status: statusFilter })

    const posts = await listQuery

    return {
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: Number(count),
          totalPages: Math.ceil(Number(count) / limit),
        },
      },
    }
  } catch (error) {
    console.error('获取文章列表失败:', error)
    throw createError({ statusCode: 500, message: '获取文章列表失败' })
  }
})
