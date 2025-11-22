// packages/admin/src/apis/auth.ts
import http from '@/utils/http'
import type { ApiResponse } from '@/utils/http/types'

export interface LoginParams {
  username: string
  password: string
}

/**
 * 登录接口
 */
export function loginApi(data: LoginParams): Promise<ApiResponse> {
  return http.post('/api/login', data)
}

/**
 * 获取当前用户信息（用于验证登录状态）
 */
export function getCurrentUser(): Promise<ApiResponse> {
  return http.get('/api/me')
}
/**
 * 退出登录接口
 */
export function logoutApi(): Promise<ApiResponse> {
  return http.post('/api/logout')
}
/**
 * 更新昵称接口
 */
export function updateNicknameApi(data: { nickname: string }) {
  return http({ url: '/api/me/nickname', method: 'PATCH', data })
}
