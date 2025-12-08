import { defineEventHandler, createError } from 'h3'
import { query } from '../../../utils/db'
import { getPostSelectFields } from '../../../utils/postDto'

// UUID v4 校验（严格版）
function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

export default defineEventHandler(async event => {
  const idParam = event.context.params?.id
  if (!idParam) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const id = idParam.trim()

  // ✅ 检查是否为合法 UUID
  if (!isValidUUID(id)) {
    throw createError({ statusCode: 400, message: '无效的 UUID 格式' })
  }

  const selectFields = getPostSelectFields()
  const res = await query(
    `
      SELECT ${selectFields}
      FROM posts
      WHERE posts.id = $1
    `,
    [id] // ← 直接传字符串，PostgreSQL 会自动转换 uuid 类型
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
