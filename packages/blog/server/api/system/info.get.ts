// packages/blog/server/api/system/info.get.ts
import { defineEventHandler } from 'h3'
import { getCookie, createError } from 'h3'
import { sessionStore } from '../../utils/sessionStore'
import { getSystemStaticInfo } from '../../utils/systemStaticInfo'

async function requireAuth(event: any) {
  const sessionToken = getCookie(event, 'session_token')
  if (!sessionToken) {
    throw createError({ statusCode: 401, message: '未提供会话凭证' })
  }
  const session = await sessionStore.get(sessionToken)
  if (!session) {
    throw createError({ statusCode: 401, message: '会话无效' })
  }
}

export default defineEventHandler(async event => {
  await requireAuth(event)
  const staticInfo = await getSystemStaticInfo()
  return {
    timestamp: new Date().toISOString(),
    ...staticInfo,
  }
})
