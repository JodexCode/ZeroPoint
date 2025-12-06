// packages\blog\server\api\admin\profile\index.get.ts
import { defineEventHandler } from 'h3'
import { getProfile } from '../../../utils/profileService'

export default defineEventHandler(async () => {
  const data = await getProfile()
  return { success: true, data }
})
