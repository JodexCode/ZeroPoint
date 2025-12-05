import { defineEventHandler, readBody } from 'h3'
import { ProfileTagSchema } from '../../../../schemas/profile'
import { createProfileTag } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const parsed = ProfileTagSchema.omit({ id: true }).parse(body)
  const id = await createProfileTag(parsed)
  return { success: true, data: { id } }
})
