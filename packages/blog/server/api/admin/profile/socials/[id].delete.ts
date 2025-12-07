// packages/blog/server/api/admin/profile/socials/[id].delete.ts
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { deleteSocial } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const idParam = getRouterParam(event, 'id')
  const id = Number(idParam)

  if (!idParam || isNaN(id) || id <= 0) {
    throw createError({ statusCode: 400, message: '无效的 ID' })
  }

  await deleteSocial(id)
  return { success: true }
})
