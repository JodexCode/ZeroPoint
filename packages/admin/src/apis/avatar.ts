// packages/admin/src/apis/avatar.ts
import http from '@/utils/http'

export interface AvatarSignResponse {
  uploadUrl: string
  fileUrl: string
  key: string
}

export function getAvatarUploadSign(data: {
  mimeType: string
}): Promise<{ data: AvatarSignResponse }> {
  return http({
    url: '/api/upload/admin-avatar-sign',
    method: 'POST',
    data,
  })
}

export function updateAdminAvatar(data: { avatarUrl: string }): Promise<any> {
  return http({
    url: '/api/me/avatar',
    method: 'PATCH',
    data,
  })
}
