import type { ApiResponse } from '@/utils/http/types'
import http from '@/utils/http'
import type {
  ProfileDto,
  SocialItem,
  ProfileTagItem,
  SocialCreateParams,
  ProfileTagCreateParams,
} from '@/types/profile'

/**
 * 获取主配置（作者名、简介、关于我、备案号）
 */
export function getProfileApi(): Promise<ApiResponse & { data: ProfileDto }> {
  return http.get('/api/admin/profile')
}

/**
 * 更新主配置
 */
export function updateProfileApi(data: ProfileDto): Promise<ApiResponse> {
  return http.put('/api/admin/profile', data)
}

/**
 * 获取社交媒体列表
 */
export function getSocialsApi(): Promise<ApiResponse & { data: SocialItem[] }> {
  return http.get('/api/admin/profile/socials')
}

/**
 * 新增社交媒体
 */
export function createSocialApi(
  data: SocialCreateParams
): Promise<ApiResponse & { data: { id: number } }> {
  return http.post('/api/admin/profile/socials', data)
}

/**
 * 更新社交媒体
 */
export function updateSocialApi(id: number, data: Partial<SocialItem>): Promise<ApiResponse> {
  return http.put(`/api/admin/profile/socials/${id}`, data)
}

/**
 * 删除社交媒体
 */
export function deleteSocialApi(id: number): Promise<ApiResponse> {
  return http.delete(`/api/admin/profile/socials/${id}`)
}

/**
 * 获取个人标签列表
 */
export function getProfileTagsApi(): Promise<ApiResponse & { data: ProfileTagItem[] }> {
  return http.get('/api/admin/profile/tags')
}

/**
 * 新增个人标签
 */
export function createProfileTagApi(
  data: ProfileTagCreateParams
): Promise<ApiResponse & { data: { id: number } }> {
  return http.post('/api/admin/profile/tags', data)
}

/**
 * 更新个人标签
 */
export function updateProfileTagApi(
  id: number,
  data: Partial<ProfileTagItem>
): Promise<ApiResponse> {
  return http.put(`/api/admin/profile/tags/${id}`, data)
}

/**
 * 删除个人标签
 */
export function deleteProfileTagApi(id: number): Promise<ApiResponse> {
  return http.delete(`/api/admin/profile/tags/${id}`)
}
