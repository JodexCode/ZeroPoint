import { defineEventHandler, readBody } from 'h3'
import { SocialSchema } from '../../../../schemas/profile'
import { updateSocial } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const parsed = SocialSchema.partial().parse(body)
  await updateSocial(id, parsed)
  return { success: true }
})
