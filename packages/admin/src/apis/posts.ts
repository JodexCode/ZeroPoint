// packages/admin/src/apis/posts.ts
import type {
  CreatedPostData,
  PostCreateParams,
  PostItemRaw,
  PostsListResponse,
  PostUpdateParams,
  TagItem,
  UploadSign,
} from '@/types/post'
import http from '@/utils/http'
import type { ApiResponse } from '@/utils/http/types'

/**
 * 获取文章列表
 */
export function getPostsApi(
  params: {
    page?: number
    limit?: number
    status?: 'draft' | 'published'
    tag?: string | '_untagged'
  } = {}
): Promise<ApiResponse & { data: PostsListResponse }> {
  return http.get('/api/admin/posts', { params })
}

/**
 * 获取单篇文章详情
 */
export function getPostByIdApi(id: number | string): Promise<ApiResponse & { data: PostItemRaw }> {
  return http.get(`/api/admin/posts/${id}`)
}

/**
 * 创建新文章
 */
export function createPostApi(
  data: PostCreateParams
): Promise<ApiResponse & { data: CreatedPostData }> {
  return http.post('/api/admin/posts', data)
}

/**
 * 更新文章
 */
export function updatePostApi(
  id: number | string,
  data: PostUpdateParams
): Promise<ApiResponse & { data: PostItemRaw }> {
  return http.put(`/api/admin/posts/${id}`, data)
}

/**
 * 删除文章
 */
export function deletePostApi(id: number | string): Promise<ApiResponse> {
  return http.delete(`/api/admin/posts/${id}`)
}

export const getAllTagsApi = (): Promise<ApiResponse & { data: TagItem[] }> =>
  http.get('/api/admin/tags')

export const getCoverSignApi = (data: { mimeType: string }) =>
  http.post<UploadSign>('/api/upload/cover', data) // ← 直接返回 UploadSign

export const getImageSignApi = (data: { mimeType: string }) =>
  http.post<UploadSign>('/api/upload/image', data)

export const deleteAssetsApi = (data: { keys: string[] }) =>
  http.post<{ total: number; failed: { key: string; reason: any }[] }>('/api/upload/delete', data)
