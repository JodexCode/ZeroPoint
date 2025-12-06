// packages\blog\server\api\admin\profile\index.put.ts
import { defineEventHandler, readBody } from 'h3'
import { ProfileSchema } from '../../../schemas/profile'
import { updateProfile } from '../../../utils/profileService'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const parsed = ProfileSchema.parse(body)
  await updateProfile(parsed)
  return { success: true }
})
