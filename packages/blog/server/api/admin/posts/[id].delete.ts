// packages/blog/server/api/admin/posts/[id].delete.ts
import { defineEventHandler, createError } from 'h3'
import { getDbPool } from '../../../utils/db'

export default defineEventHandler(async event => {
  const idParam = event.context.params?.id
  if (!idParam) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const id = Number(idParam)
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    throw createError({ statusCode: 400, message: '无效的文章 ID' })
  }

  const pool = getDbPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 先检查文章是否存在（可选，但建议）
    const checkRes = await client.query('SELECT id FROM posts WHERE id = $1', [id])
    if (checkRes.rows.length === 0) {
      throw createError({ statusCode: 404, message: '文章不存在或已被删除' })
    }

    // 删除标签关联（外键可能阻止直接删 posts）
    await client.query('DELETE FROM post_tags WHERE post_id = $1', [id])

    // 删除文章
    const _deleteRes = await client.query('DELETE FROM posts WHERE id = $1', [id])

    await client.query('COMMIT')

    return {
      success: true,
      message: '文章已删除',
    }
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('删除文章失败:', error)

    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, message: '删除文章失败' })
  } finally {
    client.release()
  }
})
