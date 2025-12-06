import { defineEventHandler, getRouterParam, createError } from 'h3'
import getDb from '../../utils/db'

export default defineEventHandler(async event => {
  const slug = getRouterParam(event, 'slug')!
  const db = await getDb()

  // 阅读量 +1
  await db('posts').where({ slug, status: 'published' }).increment('views', 1)

  // 查正文 + 基础字段
  const [post] = await db('posts')
    .where({ slug, status: 'published' })
    .select([
      'id',
      'title',
      'slug',
      'excerpt',
      'content',
      'cover_image',
      'views',
      'created_at',
      db.raw(
        `coalesce((select json_agg(tags.name) from post_tags join tags on tags.id = post_tags.tag_id where post_tags.post_id = posts.id),'[]') as tags`
      ),
    ])

  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })

  return { success: true, data: post }
})
