// packages/blog/server/api/admin/posts/[id].get.ts
import { defineEventHandler, createError } from 'h3'
import { query } from '../../../utils/db' // ← 使用已有的 query 工具
import { getPostSelectFields } from '../../../utils/postDto'

export default defineEventHandler(async event => {
  const idParam = event.context.params?.id
  if (!idParam) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const id = Number(idParam)
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    throw createError({ statusCode: 400, message: '无效的文章 ID' })
  }

  // 使用 postDto 中定义的 SELECT 字段（包含 tags 子查询）
  const selectFields = getPostSelectFields()

  const res = await query(
    `
      SELECT ${selectFields}
      FROM posts
      WHERE posts.id = $1
    `,
    [id]
  )

  const post = res.rows[0]

  if (!post) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  return {
    success: true,
    data: post,
  }
})
