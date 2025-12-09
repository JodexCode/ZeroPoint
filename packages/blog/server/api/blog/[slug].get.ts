// packages/blog/server/api/blog/[slug].get.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../utils/db'

const WINDOW_MIN = 30 // 30 分钟去重

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')!
  // 取用户真实 IP（支持反向代理）
  const raw = event.node.req.headers['x-forwarded-for']
  const ip = (Array.isArray(raw) ? raw[0] : raw)?.split(',')[0]?.trim() || '0.0.0.0'

  /* 1. 先插入/更新浏览记录（UPSERT） */
  const upsertSql = `
    INSERT INTO post_views (post_id, ip_address, viewed_at)
    SELECT p.id, $2::inet, NOW()
    FROM   posts p
    WHERE  p.slug = $1
      AND  p.status = 'published'
    ON CONFLICT (ip_address, post_id)
      DO UPDATE
         SET viewed_at = EXCLUDED.viewed_at
      WHERE post_views.viewed_at < NOW() - INTERVAL '${WINDOW_MIN} minutes'
    RETURNING (xmax = 0) AS is_new  -- 真正插入返回 true
  `
  const { rows } = await query(upsertSql, [slug, ip])
  const isNewView = rows[0]?.is_new ?? false

  /* 2. 如果是新阅读，才给 posts.views +1 */
  if (isNewView) {
    await query(`UPDATE posts SET views = views + 1 WHERE slug = $1`, [slug])
  }

  /* 3. 查文章详情（含标签） */
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
        (SELECT JSON_AGG(t.name ORDER BY t.name)
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
  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  /* 4. 返回文章 + 是否新阅读（调试用） */
  return { success: true, data: post, newView: isNewView }
})
