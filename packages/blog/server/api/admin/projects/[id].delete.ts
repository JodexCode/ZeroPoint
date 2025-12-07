// packages/blog/server/api/admin/projects/[id].delete.ts
import { defineEventHandler, createError } from 'h3'
import { getDbPool } from '../../../utils/db' // ← 获取 pool
import { deleteObject } from '../../../utils/cos'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少 id' })
  }

  const pool = getDbPool()

  // 1. 先查项目是否存在，并获取 cover_image
  const client = await pool.connect()
  let proj
  try {
    const res = await client.query(`SELECT cover_image FROM projects WHERE id = $1`, [id])
    proj = res.rows[0]
    if (!proj) {
      client.release()
      throw createError({ statusCode: 404, message: '项目不存在' })
    }

    // 2. 开启事务并删除数据库记录
    await client.query('BEGIN')
    await client.query(`DELETE FROM projects WHERE id = $1`, [id])
    await client.query('COMMIT')

    // 3. 事务成功后，尝试删除 COS 封面（即使失败也不回滚 DB）
    if (proj.cover_image) {
      try {
        const u = new URL(proj.cover_image)
        const key = u.pathname.substring(1) // 去掉开头的 '/'
        await deleteObject(key)
      } catch (e) {
        console.warn('删除 COS 封面失败:', e)
        // 不抛错，避免影响删除成功响应
      }
    }
  } catch (e) {
    await client.query('ROLLBACK')
    client.release()
    throw e // 抛出 DB 错误
  }
  client.release()

  return { success: true, message: '已删除' }
})
