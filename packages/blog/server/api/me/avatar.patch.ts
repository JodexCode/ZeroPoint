// packages/blog/server/api/me/avatar.patch.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import getDb from '../../utils/db'
import { deleteObject } from '../../utils/cos'

const UpdateAvatarSchema = z.object({
  avatarUrl: z.string().url(),
})

export default defineEventHandler(async event => {
  const adminSession = event.context.admin!
  const body = await readBody(event)
  const { avatarUrl } = UpdateAvatarSchema.parse(body)

  const cosDomain = process.env.COS_DOMAIN?.replace(/\/$/, '')
  if (!cosDomain) {
    throw createError({ statusCode: 500, message: 'COS_DOMAIN 未配置' })
  }

  try {
    const url = new URL(avatarUrl)
    if (url.origin !== cosDomain || !url.pathname.startsWith('/admin/logo/')) {
      throw new Error('无效的头像 URL')
    }
  } catch {
    throw createError({ statusCode: 400, message: '无效的头像 URL' })
  }

  const db = await getDb()
  const currentAdmin = await db('admins')
    .where('id', adminSession.adminId)
    .select('avatar_url')
    .first()

  if (!currentAdmin) {
    throw createError({ statusCode: 404, message: '管理员账户不存在' })
  }

  // 删除旧头像（带容错）
  const oldAvatarUrl = currentAdmin.avatar_url
  if (oldAvatarUrl) {
    try {
      const oldUrl = new URL(oldAvatarUrl)
      if (oldUrl.origin === cosDomain && oldUrl.pathname.startsWith('/admin/logo/')) {
        const key = oldUrl.pathname.substring(1)
        await deleteObject(key)
      }
    } catch (deleteErr) {
      console.warn('删除旧头像失败（不影响更新）:', deleteErr)
    }
  }

  // 更新新头像
  const result = await db('admins')
    .where('id', adminSession.adminId)
    .update({ avatar_url: avatarUrl })

  if (result === 0) {
    throw createError({ statusCode: 404, message: '更新失败：账户不存在' })
  }

  return {
    success: true,
    message: '头像更新成功',
  }
})
