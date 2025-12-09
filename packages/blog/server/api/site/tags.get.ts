// packages\blog\server\api\site\tags.get.ts
import { listProfileTags } from '../../utils/profileService'

export default defineEventHandler(async () => {
  const list = await listProfileTags()
  return { success: true, data: list }
})
