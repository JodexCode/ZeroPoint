// packages/admin/src/utils/upload.ts
import { getCoverSignApi, getImageSignApi } from '@/apis/posts'
import { getAvatarUploadSign } from '@/apis/avatar'
import type { UploadSign } from '@/types/post'

type UploadType = 'cover' | 'image' | 'avatar'

/**
 * 通用带进度上传（封面 / 插图 / 头像）
 * @param file       文件
 * @param type       上传类型
 * @param onProgress 进度回调 0-100
 * @returns          上传后的访问地址
 */
export async function uploadWithProgress(
  file: File,
  type: UploadType,
  onProgress: (percent: number) => void
): Promise<string> {
  const api =
    type === 'cover' ? getCoverSignApi : type === 'avatar' ? getAvatarUploadSign : getImageSignApi
  const res: UploadSign = (await api({ mimeType: file.type })).data

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', res.uploadUrl, true)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = e =>
      e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve(res.fileUrl)
        : reject(new Error(xhr.statusText))
    xhr.onerror = () => reject(new Error('network'))
    xhr.send(file)
  })
}
