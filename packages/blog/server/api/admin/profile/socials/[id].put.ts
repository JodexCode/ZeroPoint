// packages/blog/server/api/admin/profile/socials/[id].put.ts
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { SocialSchema } from '../../../../schemas/profile'
import { updateSocial } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!idParam || isNaN(id) || id <= 0) {
    throw createError({ statusCode: 400, message: '无效的 ID' })
  }

  const body = await readBody(event)
  const parsed = SocialSchema.partial().parse(body)
  await updateSocial(id, parsed)
  return { success: true }
})
