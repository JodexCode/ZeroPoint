// packages\blog\server\api\admin\profile\socials\index.get.ts
import { defineEventHandler } from 'h3'
import { listSocials } from '../../../../utils/profileService'

export default defineEventHandler(async () => {
  const data = await listSocials()
  return { success: true, data }
})
