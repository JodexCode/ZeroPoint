// packages\blog\server\api\admin\projects\[id].delete.ts
import { defineEventHandler, createError } from 'h3'
import getDb from '../../../utils/db'
import { deleteObject } from '../../../utils/cos'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少 id' })

  const db = await getDb()
  const proj = await db('projects').where({ id }).first('cover_image')
  if (!proj) throw createError({ statusCode: 404, message: '项目不存在' })

  // 事务内删除行 + 删图
  await db.transaction(async trx => {
    await trx('projects').where({ id }).del()
    if (proj.cover_image) {
      try {
        const u = new URL(proj.cover_image)
        const key = u.pathname.substring(1)
        await deleteObject(key)
      } catch (e) {
        console.warn('删除封面失败:', e)
      }
    }
  })

  return { success: true, message: '已删除' }
})
