// packages/blog/server/api/admin/posts/[id].put.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { PostUpdateSchema } from '../../../schemas/post'
import { getDbPool } from '../../../utils/db' // ← 获取连接池
import { setPostTagsInTransaction } from '../../../utils/tagService' // ← 需支持传入 client

export default defineEventHandler(async event => {
  const idParam = event.context.params?.id
  if (!idParam) {
    throw createError({ statusCode: 400, message: '缺少文章 ID' })
  }

  const id = Number(idParam)
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    throw createError({ statusCode: 400, message: '无效的文章 ID' })
  }

  const body = await readBody(event)

  // Zod 校验
  let input
  try {
    input = PostUpdateSchema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: '参数验证失败',
        data: error.issues.map(issue => issue.message),
      })
    }
    throw error
  }

  const pool = getDbPool()
  const client = await pool.connect()

  try {
    // 检查文章是否存在
    const checkRes = await client.query('SELECT id FROM posts WHERE id = $1', [id])
    if (checkRes.rows.length === 0) {
      throw createError({ statusCode: 404, message: '文章不存在' })
    }

    // 开启事务
    await client.query('BEGIN')

    // 更新文章
    const updateRes = await client.query(
      `
        UPDATE posts
        SET
          title = $1,
          content = $2,
          excerpt = $3,
          cover_image = $4,
          status = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `,
      [
        input.title,
        input.content,
        input.excerpt || null,
        input.coverImage || null,
        input.status,
        id,
      ]
    )

    const updated = updateRes.rows[0]

    // 更新标签（需传入 client 以复用事务）
    await setPostTagsInTransaction(client, id, input.tags || [])

    // 提交事务
    await client.query('COMMIT')

    return {
      success: true,
      data: updated,
    }
  } catch (error: any) {
    await client.query('ROLLBACK')
    console.error('更新文章失败:', error)

    if (error.statusCode) {
      throw error // 透传 400/404
    }
    throw createError({ statusCode: 500, message: '更新文章失败' })
  } finally {
    client.release()
  }
})
