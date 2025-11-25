// packages\blog\server\api\upload\delete.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { deleteObject } from '../../utils/cos'

const schema = z.object({
  keys: z.array(z.string().min(1)).max(20),
})

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { keys } = schema.parse(body)

    const res = await Promise.allSettled(keys.map(k => deleteObject(k)))
    const failed = res
      .map((r, i) => (r.status === 'rejected' ? { key: keys[i], reason: r.reason } : null))
      .filter(Boolean)

    if (failed.length) console.warn('[DeleteAssets] partial fail:', failed)

    return {
      success: true,
      data: { total: keys.length, failed },
    }
  } catch (err: any) {
    console.error('[DeleteAssets]', err)
    if (err instanceof z.ZodError) throw createError({ statusCode: 400, statusMessage: '参数错误' })
    throw createError({ statusCode: 500, statusMessage: '删除失败' })
  }
})
