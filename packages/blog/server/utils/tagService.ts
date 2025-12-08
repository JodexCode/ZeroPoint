// packages/blog/server/utils/tagService.ts
import { getDbPool, query } from './db'
import { getPostSelectFields } from './postDto'
import { slugify } from './slugify'
import type { PoolClient } from 'pg'

/* 写入标签（事务内自动建标签+去重 + 拼音化） */
export async function setPostTags(postId: string, rawNames: string[]): Promise<void> {
  const pool = getDbPool()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await setPostTagsInTransaction(client, postId, rawNames)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

/* 前端下拉：全部标签 + 使用次数 */
export async function getAllTags(count = 100) {
  const res = await query(
    `
      SELECT
        tags.id,
        tags.name,
        tags.slug,
        COUNT(posts.id) AS used
      FROM tags
      LEFT JOIN post_tags ON tags.id = post_tags.tag_id
      LEFT JOIN posts ON post_tags.post_id = posts.id AND posts.status = 'published'
      GROUP BY tags.id
      ORDER BY used DESC, tags.name ASC
      LIMIT $1
    `,
    [count]
  )
  return res.rows.map(row => ({
    ...row,
    used: Number(row.used),
  }))
}

/* 统一列表查询 */
export async function getPostList({
  page = 1,
  limit = 10,
  status,
  tagSlug,
}: {
  page: number
  limit: number
  status?: 'draft' | 'published'
  tagSlug?: string
}) {
  const offset = (page - 1) * limit
  const selectFields = getPostSelectFields()

  let baseQuery = ''
  let countQuery = ''
  const params: any[] = []
  let paramIndex = 1

  if (tagSlug === '_untagged') {
    baseQuery = `
      FROM posts
      LEFT JOIN post_tags ON posts.id = post_tags.post_id
      WHERE post_tags.tag_id IS NULL
    `
    countQuery = baseQuery
    if (status) {
      baseQuery += ` AND posts.status = $${paramIndex}`
      countQuery += ` AND posts.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
  } else if (tagSlug) {
    baseQuery = `
      FROM posts
      INNER JOIN post_tags ON posts.id = post_tags.post_id
      INNER JOIN tags ON post_tags.tag_id = tags.id
      WHERE tags.slug = $${paramIndex}
    `
    countQuery = baseQuery
    params.push(tagSlug)
    paramIndex++
    if (status) {
      baseQuery += ` AND posts.status = $${paramIndex}`
      countQuery += ` AND posts.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
  } else {
    baseQuery = 'FROM posts'
    countQuery = baseQuery
    if (status) {
      baseQuery += ` WHERE posts.status = $${paramIndex}`
      countQuery += ` WHERE posts.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }
  }

  // 获取总数
  const countRes = await query(`SELECT COUNT(*) AS count ${countQuery}`, params)
  const total = Number(countRes.rows[0].count)

  // 获取分页数据
  const dataParams = [...params, limit, offset]
  const postsRes = await query(
    `
      SELECT ${selectFields}
      ${baseQuery}
      ORDER BY posts.created_at DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `,
    dataParams
  )

  return {
    posts: postsRes.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function setPostTagsInTransaction(
  client: PoolClient,
  postId: string,
  rawNames: string[]
): Promise<void> {
  const names = [...new Set(rawNames.map(t => t.toLowerCase().trim()).filter(Boolean))]

  // 清空旧关联
  await client.query('DELETE FROM post_tags WHERE post_id = $1', [postId])

  if (names.length === 0) {
    return
  }

  // 批量插入标签（安全方式）
  await client.query(
    `
      INSERT INTO tags (name, slug)
      SELECT unnest($1::text[]), unnest($2::text[])
      ON CONFLICT (name) DO NOTHING
    `,
    [names, names.map(slugify)]
  )

  // 获取标签 ID
  const tagIdsRes = await client.query(`SELECT id FROM tags WHERE name = ANY($1::text[])`, [names])
  const tagIds = tagIdsRes.rows.map(r => r.id)

  // 插入新关联
  if (tagIds.length > 0) {
    const placeholders = tagIds.map((_, i) => `($1, $${i + 2})`).join(', ')
    await client.query(`INSERT INTO post_tags (post_id, tag_id) VALUES ${placeholders}`, [
      postId,
      ...tagIds,
    ])
  }
}
