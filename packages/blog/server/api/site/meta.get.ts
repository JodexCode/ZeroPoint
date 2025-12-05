import { getProfile } from '../../utils/profileService'

export default defineEventHandler(async () => {
  const meta = await getProfile()
  return { success: true, data: meta }
})
