// packages\blog\server\api\admin\profile\tags\[id].delete.ts
import { defineEventHandler } from 'h3'
import { deleteProfileTag } from '../../../../utils/profileService'

export default defineEventHandler(async event => {
  const id = Number(getRouterParam(event, 'id'))
  await deleteProfileTag(id)
  return { success: true }
})
