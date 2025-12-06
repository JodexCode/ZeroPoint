// packages\blog\server\api\admin\profile\socials\index.post.ts
import { defineEventHandler, readBody } from 'h3'
import { SocialSchema } from '../../../../schemas/profile'
import { createSocial } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const parsed = SocialSchema.omit({ id: true }).parse(body)
  const id = await createSocial(parsed)
  return { success: true, data: { id } }
})
