// packages/blog/server/api/blog/list.get.ts
import { defineEventHandler, getQuery } from 'h3'
import { getPostList } from '../../utils/tagService'

export default defineEventHandler(async event => {
  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const limit = Math.min(50, Number(q.limit) || 12)
  const tag = q.tag?.toString() // 支持标签筛选或 _untagged
  const search = q.search?.toString().trim() // 🔍 新增搜索参数

  // 直接复用后台逻辑，但强制 status = published
  const { posts, pagination } = await getPostList({
    page,
    limit,
    status: 'published', // 前台只看已发布
    tagSlug: tag,
    search, // 🔍 传入搜索参数
  })

  return {
    success: true,
    data: {
      list: posts,
      pagination,
    },
  }
})
