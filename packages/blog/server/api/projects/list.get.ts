// packages/blog/server/api/projects/list.get.ts
import { defineEventHandler, getQuery } from 'h3'
import getDb from '../../utils/db'

export default defineEventHandler(async event => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 12)
  const sort = q.sort === 'createdAt' ? 'created_at' : 'priority'
  const order = q.order === 'asc' ? 'asc' : 'desc'

  const db = await getDb()

  // 1. 总数
  const countResult = (await db('projects').where('status', 'published').count('* as count')) as {
    count: string
  }[]

  const total = Number(countResult[0].count)

  // 2. 列表
  const list = await db('projects')
    .where('status', 'published')
    .select([
      'id',
      'title', // 前端仍用 p.name 兼容
      'slug',
      'description',
      'tech_stack', // 数组，直接返回
      'demo_url', // 对应之前的 homepage
      'repo_url',
      'cover_image',
      'created_at',
    ])
    .orderBy(sort, order)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit)

  return {
    success: true,
    data: {
      list,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  }
})
