// packages\blog\server\api\upload\projects-cover.post.ts
import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { getUploadSignUrl } from '../../utils/cos'

const Schema = z.object({
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/i),
})

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const { mimeType } = Schema.parse(body)
  const sign = getUploadSignUrl({ prefix: 'project/cover', mimeType })
  return { success: true, data: sign }
})
