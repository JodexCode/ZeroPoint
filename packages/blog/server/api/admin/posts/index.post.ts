// packages/blog/server/api/admin/posts/index.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { PostCreateSchema } from '../../../schemas/post'
import { query } from '../../../utils/db' // ← 正确导入
import { slugify } from '../../../utils/slugify'
import { setPostTags } from '../../../utils/tagService'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const input = PostCreateSchema.parse(body)

  /* 生成唯一 slug */
  let baseSlug = slugify(input.title)
  let slug = baseSlug
  let exists: boolean
  let attempts = 0

  do {
    const res = await query(`SELECT id FROM posts WHERE slug = $1`, [slug])
    exists = res.rows.length > 0
    if (exists) {
      attempts++
      slug = `${baseSlug}-${attempts}`
    }
  } while (exists && attempts < 5)

  if (exists) {
    throw createError({ statusCode: 500, message: '无法生成唯一链接' })
  }

  /* 插入文章 */
  const insertRes = await query(
    `
      INSERT INTO posts (
        title,
        slug,
        content,
        excerpt,
        cover_image,
        status,
        views
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      input.title,
      slug,
      input.content,
      input.excerpt || null,
      input.coverImage || null,
      input.status,
      0, // views 初始为 0
    ]
  )

  const post = insertRes.rows[0]

  /* 写入标签（空数组=未分类，不插关系） */
  await setPostTags(post.id, input.tags || [])

  return {
    success: true,
    data: {
      id: post.id,
      title: post.title,
      slug: post.slug,
      status: post.status,
      createdAt: post.created_at,
    },
  }
})
