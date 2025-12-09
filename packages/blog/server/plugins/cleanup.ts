// packages\blog\server\plugins\cleanup.ts
import { Cron } from 'croner'

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV === 'production') {
    new Cron('0 3 * * *', { timezone: 'Asia/Shanghai' }, async () => {
      const { rowCount } = await query(
        `DELETE FROM post_views WHERE viewed_at < NOW() - INTERVAL '30 days'`
      )
      console.log(`[cron] 自动清理完成，删除 ${rowCount} 条记录`)
    })
  }
})
