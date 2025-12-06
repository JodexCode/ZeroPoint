// packages\blog\server\api\admin\profile\socials\[id].delete.ts
import { defineEventHandler } from 'h3'
import { deleteSocial } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const id = Number(getRouterParam(event, 'id'))
  await deleteSocial(id)
  return { success: true }
})
