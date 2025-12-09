// packages\blog\server\api\site\socials.get.ts
import { listSocials } from '../../utils/profileService'

export default defineEventHandler(async () => {
  const list = await listSocials()
  return { success: true, data: list }
})
