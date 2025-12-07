// packages/blog/server/api/admin/projects/index.get.ts
import { defineEventHandler, getQuery } from 'h3'
import { query } from '../../../utils/db' // 使用统一的查询工具

export default defineEventHandler(async event => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(100, Number(q.limit) || 10)
  const status = q.status === 'draft' || q.status === 'published' ? q.status : undefined
  const sort = q.sort === 'createdAt' ? 'created_at' : 'priority' // 默认 priority
  const order = q.order === 'asc' ? 'asc' : 'desc'

  // 计算总数量和总页数
  let countQuery = 'SELECT COUNT(*) FROM projects'
  let conditions = []
  let values = []

  if (status) {
    conditions.push('status = $1')
    values.push(status)
  }

  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ')
  }

  const { rows: countRows } = await query(countQuery, values)
  const total = parseInt(countRows[0].count, 10)

  // 获取项目列表
  let selectQuery = `
    SELECT * FROM projects
    ${status ? 'WHERE status = $1' : ''}
    ORDER BY ${sort} ${order}, created_at desc
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `

  values.push(limit, (page - 1) * limit) // 添加limit和offset参数

  const { rows } = await query(selectQuery, values)

  return {
    success: true,
    data: {
      rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  }
})
