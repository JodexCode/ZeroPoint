// packages/blog/server/api/me/avatar.patch.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { query } from '../../utils/db' // ← 正确导入原生 query
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

  // 校验新头像 URL 是否来自合法 COS 路径
  try {
    const url = new URL(avatarUrl)
    if (url.origin !== cosDomain || !url.pathname.startsWith('/admin/logo/')) {
      throw new Error('无效的头像 URL')
    }
  } catch {
    throw createError({ statusCode: 400, message: '无效的头像 URL' })
  }

  // 1. 查询当前管理员的旧头像
  const selectRes = await query(`SELECT avatar_url FROM admins WHERE id = $1`, [
    adminSession.adminId,
  ])
  const currentAdmin = selectRes.rows[0]

  if (!currentAdmin) {
    throw createError({ statusCode: 404, message: '管理员账户不存在' })
  }

  // 2. 删除旧头像（带容错）
  const oldAvatarUrl = currentAdmin.avatar_url
  if (oldAvatarUrl) {
    try {
      const oldUrl = new URL(oldAvatarUrl)
      if (oldUrl.origin === cosDomain && oldUrl.pathname.startsWith('/admin/logo/')) {
        const key = oldUrl.pathname.substring(1) // 移除开头的 '/'
        await deleteObject(key)
      }
    } catch (deleteErr) {
      console.warn('删除旧头像失败（不影响更新）:', deleteErr)
    }
  }

  // 3. 更新新头像 URL
  const updateRes = await query(`UPDATE admins SET avatar_url = $1 WHERE id = $2 RETURNING id`, [
    avatarUrl,
    adminSession.adminId,
  ])

  if (updateRes.rowCount === 0) {
    throw createError({ statusCode: 404, message: '更新失败：账户不存在' })
  }

  return {
    success: true,
    message: '头像更新成功',
  }
})
