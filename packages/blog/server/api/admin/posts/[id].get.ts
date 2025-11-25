import { defineEventHandler, createError } from 'h3'
import getDb from '../../../utils/db'
import { postDto } from '../../../utils/postDto' // ← 引入公用字段

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少文章 ID' })

  const db = await getDb()
  const post = await db('posts')
    .select([
      ...(await postDto()), // ← 同样用 DTO
      db
        .select(db.raw('json_agg(tags.name order by tags.name)'))
        .from('post_tags')
        .join('tags', 'tags.id', 'post_tags.tag_id')
        .whereRaw('post_tags.post_id = posts.id')
        .as('tags'),
    ])
    .where({ 'posts.id': id })
    .first()

  if (!post) throw createError({ statusCode: 404, message: '文章不存在' })
  return { success: true, data: post }
})
