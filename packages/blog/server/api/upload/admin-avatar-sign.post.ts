// packages/blog/server/api/upload/admin-avatar-sign.post.ts

import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { z } from 'zod'
import { getUploadSignUrl } from '../../utils/cos' // 同步函数
import { sessionStore } from '../../utils/sessionStore'

const SignSchema = z.object({
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|gif|webp)$/i),
})

export default defineEventHandler(async event => {
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const session = await sessionStore.get(token)
  if (!session) {
    throw createError({ statusCode: 401, message: '会话已过期，请重新登录' })
  }

  try {
    const body = await readBody(event)
    const { mimeType } = SignSchema.parse(body)

    const result = getUploadSignUrl({
      prefix: 'admin/logo',
      mimeType,
    })

    return {
      success: true,
      data: {
        uploadUrl: result.uploadUrl,
        fileUrl: result.fileUrl,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        message: '参数错误',
        data: error.issues.map(i => i.message),
      })
    }
    console.error('生成头像上传链接失败:', error)
    throw createError({ statusCode: 500, message: '服务器内部错误' })
  }
})
