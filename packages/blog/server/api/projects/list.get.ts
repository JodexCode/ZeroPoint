// packages/blog/server/api/projects/list.get.ts
import { defineEventHandler, getQuery } from 'h3'
import { query } from '../../utils/db'

export default defineEventHandler(async event => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 12)

  // 安全处理排序字段：只允许白名单
  let sortField = 'priority'
  if (q.sort === 'createdAt') {
    sortField = 'created_at'
  }

  const orderDir = q.order === 'asc' ? 'ASC' : 'DESC'

  const offset = (page - 1) * limit

  // 1. 查询总数
  const countRes = await query(
    `SELECT COUNT(*)::int AS count
     FROM projects
     WHERE status = $1`,
    ['published']
  )
  const total = countRes.rows[0]?.count || 0

  // 2. 查询列表
  const listRes = await query(
    `
    SELECT
      id,
      title,           -- 前端仍用 p.name 兼容（实际返回 title）
      slug,
      description,
      tech_stack,      -- JSON 数组，PostgreSQL 原生支持
      demo_url,
      repo_url,
      cover_image,
      created_at
    FROM projects
    WHERE status = $1
    ORDER BY ${sortField} ${orderDir}, created_at DESC
    LIMIT $2 OFFSET $3
    `,
    ['published', limit, offset]
  )

  const list = listRes.rows

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
