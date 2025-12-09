// server/api/projects/count.get.ts
import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await query('SELECT COUNT(*)::INT AS total FROM projects')
  return rows[0].total // 直接返回数字
})
