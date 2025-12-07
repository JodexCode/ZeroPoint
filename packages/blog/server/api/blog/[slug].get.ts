// packages/blog/server/api/blog/[slug].get.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../utils/db' // ← 正确导入

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')!

  // 1. 先更新阅读量（仅对 published 文章）
  const updateRes = await query(
    `UPDATE posts SET views = views + 1
     WHERE slug = $1 AND status = 'published'`,
    [slug]
  )

  // 如果没有匹配的文章，直接 404
  if (updateRes.rowCount === 0) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  // 2. 查询文章详情（含标签）
  const selectRes = await query(
    `
    SELECT
      p.id,
      p.title,
      p.slug,
      p.excerpt,
      p.content,
      p.cover_image,
      p.views,
      p.created_at,
      COALESCE(
        (SELECT JSON_AGG(t.name)
         FROM post_tags pt
         JOIN tags t ON t.id = pt.tag_id
         WHERE pt.post_id = p.id),
        '[]'::json
      ) AS tags
    FROM posts p
    WHERE p.slug = $1 AND p.status = 'published'
    `,
    [slug]
  )

  const post = selectRes.rows[0]

  // 理论上不会为 null（因为刚更新成功），但防御性检查
  if (!post) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  return { success: true, data: post }
})
