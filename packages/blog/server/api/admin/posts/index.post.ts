// packages\blog\server\api\admin\posts\index.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { PostCreateSchema } from '../../../schemas/post'
import getDb from '../../../utils/db'
import { slugify } from '../../../utils/slugify'
import { setPostTags } from '../../../utils/tagService' // ← 新增

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const input = PostCreateSchema.parse(body)

  const db = await getDb()

  /* 生成唯一 slug（略，同你旧代码） */
  let slug = slugify(input.title)
  let exists,
    attempts = 0
  do {
    exists = await db('posts').where({ slug }).first('id')
    if (exists) {
      slug = slugify(input.title)
      attempts++
    }
  } while (exists && attempts < 5)
  if (exists) throw createError({ statusCode: 500, message: '无法生成唯一链接' })

  /* 插入文章 */
  const [post] = await db('posts')
    .insert({
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt || null,
      cover_image: input.coverImage || null,
      status: input.status,
      views: 0,
    })
    .returning('*')

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
