// packages/blog/server/api/admin/projects/[id].get.ts
import { defineEventHandler, createError } from 'h3'
import { query } from '../../../utils/db' // ← 正确导入统一 query

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少 id' })
  }

  const res = await query(`SELECT * FROM projects WHERE id = $1`, [id])

  const row = res.rows[0]

  if (!row) {
    throw createError({ statusCode: 404, message: '项目不存在' })
  }

  return { success: true, data: row }
})
