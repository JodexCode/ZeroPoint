import { defineEventHandler, getQuery } from 'h3'
import getDb from '../../../utils/db'

export default defineEventHandler(async event => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 10)
  const status = q.status === 'draft' || q.status === 'published' ? q.status : undefined
  const sort = q.sort === 'createdAt' ? 'created_at' : 'priority' // 默认 priority
  const order = q.order === 'asc' ? 'asc' : 'desc'

  const db = await getDb()
  let base = db('projects').modify(builder => {
    if (status) builder.where('status', status)
  })

  const [{ count }] = await base.clone().count('* as count')
  const rows = await base
    .orderBy(sort, order)
    .orderBy('created_at', 'desc') // 次级排序
    .limit(limit)
    .offset((page - 1) * limit)

  return {
    success: true,
    data: {
      rows,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    },
  }
})
