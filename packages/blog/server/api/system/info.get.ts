// packages/blog/server/api/system/info.get.ts
import { defineEventHandler } from 'h3'
import { getSystemStaticInfo } from '../../utils/systemStaticInfo'

export default defineEventHandler(async () => {
  const staticInfo = await getSystemStaticInfo()
  return {
    timestamp: new Date().toISOString(),
    ...staticInfo,
  }
})
