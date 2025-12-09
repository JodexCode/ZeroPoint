// packages\blog\server\api\site\meta.get.ts
import { getProfile } from '../../utils/profileService'

export default defineEventHandler(async () => {
  const meta = await getProfile()
  return { success: true, data: meta }
})
