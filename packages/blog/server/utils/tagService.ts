// packages/blog/server/utils/tagService.ts
import { getDbPool, query } from './db'
import { getPostSelectFields } from './postDto'
import { slugify } from './slugify'
import type { PoolClient } from 'pg'
import PinyinMatch from 'pinyin-match'

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

/* 统一列表查询 - 支持搜索、分页、标签筛选 */
export async function getPostList({
  page = 1,
  limit = 10,
  status,
  tagSlug,
  search,
}: {
  page: number
  limit: number
  status?: 'draft' | 'published'
  tagSlug?: string
  search?: string
}) {
  const offset = (page - 1) * limit
  const selectFields = getPostSelectFields()

  const where: string[] = []
  const params: any[] = []

  /* 1. 搜索：字符级 OR 拉回候选集 */
  if (search) {
    const chars = Array.from(search.toLowerCase())
    const placeholders: string[] = []
    chars.forEach(ch => {
      params.push(`%${ch}%`)
      placeholders.push(
        `(posts.title ILIKE $${params.length} OR posts.excerpt ILIKE $${params.length})`
      )
    })
    where.push(placeholders.join(' OR '))
  }

  /* 2. 标签筛选 */
  if (tagSlug === '_untagged') {
    where.push('post_tags.tag_id IS NULL')
  } else if (tagSlug) {
    params.push(tagSlug)
    where.push(`tags.slug = $${params.length}`)
  }

  /* 3. 状态筛选 */
  if (status) {
    params.push(status)
    where.push(`posts.status = $${params.length}`)
  }

  /* 4. 拼接 WHERE */
  const whereSQL = where.length ? 'WHERE ' + where.join(' AND ') : 'WHERE TRUE'

  /* 5. JOIN */
  let joinSQL = ''
  if (tagSlug && tagSlug !== '_untagged') {
    joinSQL = `
      INNER JOIN post_tags ON posts.id = post_tags.post_id
      INNER JOIN tags ON post_tags.tag_id = tags.id
    `
  } else if (tagSlug === '_untagged') {
    joinSQL = `LEFT JOIN post_tags ON posts.id = post_tags.post_id`
  }

  /* 6. 总数 */
  const countRes = await query(`SELECT COUNT(*) AS count FROM posts ${joinSQL} ${whereSQL}`, params)
  let total = Number(countRes.rows[0].count)

  /* 7. 取数据 */
  const limitIdx = params.length + 1
  const offsetIdx = params.length + 2
  const dataParams = [...params, limit, offset]
  const postsRes = await query(
    `
      SELECT ${selectFields}
      FROM posts ${joinSQL}
      ${whereSQL}
      ORDER BY posts.created_at DESC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `,
    dataParams
  )

  /* 8. 内存层：PinyinMatch 精准混写 */
  let finalPosts = postsRes.rows
  if (search) {
    const kw = search.toLowerCase()
    finalPosts = postsRes.rows
      .map(p => ({
        ...p,
        score:
          (p.title.toLowerCase().includes(kw) ? 1 : 0) ||
          (p.excerpt?.toLowerCase().includes(kw) ? 0.8 : 0) ||
          (PinyinMatch.match(p.title, kw) ? 1 : 0) ||
          (PinyinMatch.match(p.excerpt || '', kw) ? 0.8 : 0),
      }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score)
    total = finalPosts.length
  }

  /* 9. 返回 */
  return {
    posts: finalPosts,
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
