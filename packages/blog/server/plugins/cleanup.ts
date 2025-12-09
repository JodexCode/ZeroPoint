import cron from 'node-cron'
import { query } from '../utils/db'

/**
 * 每天 03:00 自动清理 30 天前的浏览记录
 * 仅生产环境运行
 */
export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV === 'production') {
    cron.schedule('0 3 * * *', async () => {
      try {
        const { rowCount } = await query(
          `DELETE FROM post_views WHERE viewed_at < NOW() - INTERVAL '30 days'`
        )
        console.log(`[cron] 自动清理完成，删除 ${rowCount} 条浏览记录`)
      } catch (e) {
        console.error('[cron] 清理失败', e)
      }
    })
    console.log('[cron] 自动清理已启动（每天 03:00）')
  }
})
