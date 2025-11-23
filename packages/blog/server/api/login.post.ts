// packages/blog/server/api/login.post.ts
import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import { z, ZodError } from 'zod'
import getDb from '../utils/db'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import type { AdminSessionData } from '../types/session'
import { sessionStore } from '../utils/sessionStore'

// 安全常量
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 // 7 天（秒）

// 输入验证 Schema
const LoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

// 提取 Zod 错误消息为扁平字符串数组
function extractZodErrorMessages(error: ZodError): string[] {
  return error.issues.map(issue => issue.message)
}

export default defineEventHandler(async event => {
  // 获取数据库实例
  const db = await getDb()

  // 解析并验证输入
  let input
  try {
    const body = await readBody(event)
    input = LoginSchema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      // 返回扁平 errors 数组，前端可直接使用
      throw createError({
        statusCode: 400,
        message: '请求参数错误',
        data: {
          errors: extractZodErrorMessages(error),
        },
      })
    }
    throw createError({ statusCode: 400, message: '无效的请求体' })
  }

  const { username, password } = input

  // 查询管理员
  const admin = await db('admins')
    .where({ username })
    .select('id', 'username', 'password_hash', 'nickname', 'avatar_url')
    .first()

  if (!admin) {
    // 防止用户名枚举攻击：统一返回相同错误
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误',
    })
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, admin.password_hash)
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      message: '用户名或密码错误',
    })
  }

  // 生成 session token
  const sessionToken = nanoid(64)

  // 存储 session 数据
  const sessionData: AdminSessionData = {
    adminId: admin.id,
    username: admin.username,
    createdAt: Date.now(),
    nickname: admin.nickname || admin.username, // 👈 回退到 username
    avatarUrl: admin.avatar_url || null,
  }
  await sessionStore.set(sessionToken, sessionData)

  // 设置安全 Cookie
  setCookie(event, 'session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  // 返回成功响应
  return {
    success: true,
    message: '登录成功',
  }
})
