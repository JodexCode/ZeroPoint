// packages\blog\server\api\site\config.get.ts
import { getProfile, listSocials, listProfileTags } from '../../utils/profileService'

export default defineEventHandler(async () => {
  const [meta, socials, tags] = await Promise.all([getProfile(), listSocials(), listProfileTags()])
  return { meta, socials, tags } // ← 不再包 success/data
})
