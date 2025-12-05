import { listProfileTags } from '../../utils/profileService'

export default defineEventHandler(async () => {
  const list = await listProfileTags()
  return { success: true, data: list }
})
