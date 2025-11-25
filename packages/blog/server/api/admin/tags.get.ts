// server/api/admin/tags.get.ts
import { defineEventHandler } from 'h3'
import { getAllTags } from '../../utils/tagService'

export default defineEventHandler(async () => {
  const tags = await getAllTags()
  return { success: true, data: tags }
})
