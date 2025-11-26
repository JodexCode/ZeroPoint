import { defineEventHandler, createError } from 'h3'
import getDb from '../../../utils/db'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少 id' })

  const db = await getDb()
  const row = await db('projects').where({ id }).first()
  if (!row) throw createError({ statusCode: 404, message: '项目不存在' })

  return { success: true, data: row }
})
