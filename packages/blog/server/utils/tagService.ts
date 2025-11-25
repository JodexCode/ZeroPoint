// packages\blog\server\utils\tagService.ts
import getDb from './db'
import { postDto } from './postDto'
import { slugify } from './slugify' // ← 1. 引入拼音函数

/* 写入标签（事务内自动建标签+去重 + 拼音化） */
export async function setPostTags(postId: string, rawNames: string[]) {
  const db = await getDb()
  const names = [...new Set(rawNames.map(t => t.toLowerCase().trim()).filter(Boolean))]

  await db.transaction(async trx => {
    if (names.length) {
      // 2. 中文 → 拼音 slug 入库
      await trx('tags')
        .insert(names.map(n => ({ name: n, slug: slugify(n) })))
        .onConflict('name')
        .ignore()
    }
    const tagIds = await trx('tags').whereIn('name', names).pluck('id')
    await trx('post_tags').where({ post_id: postId }).del()
    if (tagIds.length) {
      await trx('post_tags').insert(tagIds.map(tagId => ({ post_id: postId, tag_id: tagId })))
    }
  })
}

/* 前端下拉：全部标签 + 使用次数（used 转数字） */
export async function getAllTags(count = 100) {
  const db = await getDb()
  const tags = await db('tags')
    .leftJoin('post_tags', 'tags.id', 'post_tags.tag_id')
    .leftJoin('posts', function () {
      this.on('posts.id', '=', 'post_tags.post_id').andOnVal('posts.status', '=', 'published')
    })
    .groupBy('tags.id')
    .select('tags.id', 'tags.name', 'tags.slug')
    .count('* as used')
    .orderBy('used', 'desc')
    .limit(count)

  // 3. 顺手把 used 转数字（BigInt → Number）
  return tags.map(t => ({ ...t, used: Number(t.used) }))
}

/* 统一列表查询（支持按标签过滤、未分类） */
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
  const db = await getDb()
  const offset = (page - 1) * limit

  let base = db('posts').modify(q => {
    if (status) q.where('posts.status', status)
    if (tagSlug) {
      if (tagSlug === '_untagged') {
        q.leftJoin('post_tags', 'posts.id', 'post_tags.post_id').whereNull('post_tags.tag_id')
      } else {
        q.join('post_tags', 'posts.id', 'post_tags.post_id')
          .join('tags', 'tags.id', 'post_tags.tag_id')
          .where('tags.slug', tagSlug)
      }
    }
  })

  const [{ count }] = await base.clone().count('* as count')

  const tagSubQuery = db
    .select(db.raw('json_agg(tags.name order by tags.name)'))
    .from('post_tags')
    .join('tags', 'tags.id', 'post_tags.tag_id')
    .whereRaw('post_tags.post_id = posts.id')
    .as('tags')

  const posts = await base
    .select([...(await postDto()), tagSubQuery])
    .orderBy('posts.created_at', 'desc')
    .offset(offset)
    .limit(limit)

  return {
    posts,
    pagination: {
      page,
      limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
    },
  }
}
