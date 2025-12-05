import { defineEventHandler, readBody } from 'h3'
import { ProfileTagSchema } from '../../../../schemas/profile'
import { updateProfileTag } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = ProfileTagSchema.partial().parse(body)
  await updateProfileTag(id, parsed)
  return { success: true }
})
