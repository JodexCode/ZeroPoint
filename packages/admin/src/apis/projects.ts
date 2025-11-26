import type {
  ProjectCreateParams,
  ProjectItem,
  ProjectListResponse,
  ProjectUpdateParams,
  UploadSign,
} from '@/types/projects'
import http from '@/utils/http'
import type { ApiResponse } from '@/utils/http/types'

/** 获取项目列表 */
export function getProjectsApi(params?: {
  page?: number
  limit?: number
  status?: 'draft' | 'published'
  sort?: 'priority' | 'createdAt'
  order?: 'asc' | 'desc'
}) {
  return http.get<ProjectListResponse>('/api/admin/projects', { params })
}

/** 获取单个项目详情 */
export function getProjectByIdApi(id: string) {
  return http.get<ProjectItem>(`/api/admin/projects/${id}`)
}

/** 创建项目 */
export function createProjectApi(data: ProjectCreateParams) {
  return http.post<Pick<ProjectItem, 'id' | 'slug' | 'createdAt'>>('/api/admin/projects', data)
}

/** 更新项目 */
export function updateProjectApi(id: string, data: ProjectUpdateParams) {
  return http.put<ProjectItem>(`/api/admin/projects/${id}`, data)
}

/** 删除项目 */
export function deleteProjectApi(id: string) {
  return http.delete<ApiResponse>(`/api/admin/projects/${id}`)
}

/** 获取项目封面上传签名 */
export function getProjectCoverSignApi(data: { mimeType: string }) {
  return http.post<UploadSign>('/api/admin/projects/upload-cover', data)
}
