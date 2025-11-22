// packages/blog/server/utils/cos.ts

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(__dirname)

const COS = require('cos-nodejs-sdk-v5')

const cosInstance = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
})

export interface GetUploadSignUrlOptions {
  prefix: string
  mimeType: string
}

/**
 * 生成头像上传的预签名 URL（前端直接 PUT 上传）
 */
export function getUploadSignUrl(options: GetUploadSignUrlOptions) {
  const { prefix, mimeType } = options
  const bucket = process.env.COS_BUCKET!
  const region = process.env.COS_REGION!
  const domain = process.env.COS_DOMAIN!

  if (!bucket || !region || !domain) {
    throw new Error('Missing COS env vars: COS_BUCKET, COS_REGION, or COS_DOMAIN')
  }

  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '')
  const extMatch = mimeType.match(/image\/(jpeg|jpg|png|gif|webp|svg\+xml)/i)
  const ext = extMatch ? (extMatch[1] === 'svg+xml' ? 'svg' : extMatch[1]) : 'bin'
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const key = `${cleanPrefix}/${uniqueSuffix}.${ext}`

  /*  关键：把前端会上传的 Content-Type 算进签名  */
  const auth = cosInstance.getAuth({
    Method: 'PUT',
    Key: key,
    Expires: 600,
    Headers: { 'Content-Type': mimeType }, // ← 补上
    Query: {}, // 显式置空，避免其它干扰
  })

  const uploadUrl = `https://${bucket}.cos.${region}.myqcloud.com/${key}?${auth}`
  const fileUrl = `${domain.replace(/\/$/, '')}/${key}`

  return { uploadUrl, fileUrl, key }
}

/**
 * 删除 COS 对象（用于清理旧头像）
 */
export async function deleteObject(key: string): Promise<void> {
  const bucket = process.env.COS_BUCKET!
  const region = process.env.COS_REGION!

  return new Promise((resolve, reject) => {
    cosInstance.deleteObject({ Bucket: bucket, Region: region, Key: key }, (err: any) => {
      if (err?.statusCode === 404 || err?.code === 'NoSuchKey') {
        resolve()
      } else if (err) {
        console.error('COS delete error:', err)
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
