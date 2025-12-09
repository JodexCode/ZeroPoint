// packages\blog\server\api\blog\count.get.ts
import { query } from '../../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await query('SELECT COUNT(*)::INT AS total FROM posts')
  return rows[0].total
})
