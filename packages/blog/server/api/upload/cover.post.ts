// packages\blog\server\api\upload\cover.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { getUploadSignUrl } from '../../utils/cos'

const schema = z.object({
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/i),
})

// 上传文章封面图片
export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { mimeType } = schema.parse(body)
    const sign = getUploadSignUrl({ prefix: 'article/cover', mimeType })
    return { success: true, data: sign }
  } catch (err: any) {
    console.error('[UploadCover]', err)
    if (err instanceof z.ZodError)
      throw createError({ statusCode: 400, statusMessage: '图片格式错误' })
    throw createError({ statusCode: 500, statusMessage: '生成上传链接失败' })
  }
})
