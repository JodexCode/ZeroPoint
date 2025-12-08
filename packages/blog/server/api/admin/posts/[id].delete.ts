// packages/blog/server/api/admin/posts/[id].delete.ts
import { defineEventHandler, createError } from 'h3'
import { getDbPool } from '../../../utils/db'

export default defineEventHandler(async event => {
  const idParam = event.context.params?.id
  if (!idParam) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  // 不再需要转换为数字
  const id = idParam

  const pool = getDbPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // 检查文章是否存在
    const checkRes = await client.query('SELECT id FROM posts WHERE id = $1', [id])
    if (checkRes.rows.length === 0) {
      throw createError({ statusCode: 404, message: '文章不存在或已被删除' })
    }

    // 删除标签关联
    await client.query('DELETE FROM post_tags WHERE post_id = $1', [id])

    // 删除文章
    await client.query('DELETE FROM posts WHERE id = $1', [id])

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
