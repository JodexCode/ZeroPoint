import { defineEventHandler } from 'h3'
import { listProfileTags } from '../../../../utils/profileService'

export default defineEventHandler(async () => {
  const data = await listProfileTags()
  return { success: true, data }
})
