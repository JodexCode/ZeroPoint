// packages/blog/server/api/me/avatar.patch.ts
import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import { z } from 'zod'
import getDb from '../../utils/db'
import { sessionStore } from '../../utils/sessionStore'
import { deleteObject } from '../../utils/cos' // 👈 新增导入

const UpdateAvatarSchema = z.object({
  avatarUrl: z.string().url(),
})

export default defineEventHandler(async event => {
  // 🔐 1. 验证登录状态
  const token = getCookie(event, 'session_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '未登录' })
  }

  const session = await sessionStore.get(token)
  if (!session?.adminId) {
    throw createError({ statusCode: 401, message: '无效会话' })
  }

  // 📥 2. 解析并校验新头像 URL
  const body = await readBody(event)
  const { avatarUrl } = UpdateAvatarSchema.parse(body)

  const cosDomain = process.env.COS_DOMAIN?.replace(/\/$/, '')
  if (!cosDomain) {
    throw createError({ statusCode: 500, message: 'COS_DOMAIN 未配置' })
  }

  try {
    const url = new URL(avatarUrl)
    if (url.origin !== cosDomain) {
      throw new Error('域名不匹配')
    }
    if (!url.pathname.startsWith('/admin/logo/')) {
      throw new Error('路径不在允许的目录下')
    }
  } catch {
    throw createError({ statusCode: 400, message: '无效的头像 URL' })
  }

  // 💾 3. 获取数据库连接
  const db = await getDb()

  // 🔍 4. 查询当前头像 URL（用于删除旧文件）
  const currentAdmin = await db('admins').where('id', session.adminId).select('avatar_url').first()

  if (!currentAdmin) {
    throw createError({ statusCode: 404, message: '管理员账户不存在' })
  }

  // 🗑️ 5. 如果有旧头像，尝试删除
  const oldAvatarUrl = currentAdmin.avatar_url
  if (oldAvatarUrl) {
    try {
      const oldUrl = new URL(oldAvatarUrl)
      if (oldUrl.origin === cosDomain && oldUrl.pathname.startsWith('/admin/logo/')) {
        const key = oldUrl.pathname.substring(1) // 去掉开头的 '/'
        await deleteObject(key)
      }
    } catch (deleteErr) {
      // 删除失败不应阻断更新（比如网络抖动），只记录日志
      console.warn('删除旧头像失败（不影响更新）:', deleteErr)
    }
  }

  // ✅ 6. 更新为新头像
  try {
    const result = await db('admins').where('id', session.adminId).update({ avatar_url: avatarUrl })

    if (result === 0) {
      // 理论上不会走到这里，因为上面已查过
      throw createError({ statusCode: 404, message: '更新失败：账户不存在' })
    }

    return {
      success: true,
      message: '头像更新成功',
    }
  } catch (error: any) {
    console.error('更新头像失败:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, message: '保存失败' })
  }
})
