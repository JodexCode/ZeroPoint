// packages/blog/server/utils/postDto.ts
import getDb from './db'

export async function postDto() {
  const db = await getDb() // ← 先 await
  return [
    'posts.id',
    'posts.title',
    'posts.slug',
    'posts.excerpt',
    'posts.content',
    'posts.cover_image',
    'posts.status',
    'posts.views',
    'posts.created_at',
    'posts.updated_at',
    'posts.series_id',
    'posts.series_order',
    db.raw(`(
      select json_agg(tags.name order by tags.name)
      from post_tags
      join tags on tags.id = post_tags.tag_id
      where post_tags.post_id = posts.id
    ) as tags`),
  ]
}
