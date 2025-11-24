// packages/blog/server/utils/slugify.ts
import { customAlphabet } from 'nanoid'
import { pinyin } from 'pinyin-pro'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export function slugify(title: string): string {
  // ✅ pinyin-pro >=3 默认已启用智能分词（phrase mode）
  const pinyinArray = pinyin(title, {
    type: 'array',
    toneType: 'none', // 不带声调（可省略，默认就是 none）
  })

  let slug = pinyinArray
    .filter(word => word.trim() !== '') // 过滤空字符串（防边界情况）
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)

  if (!slug) slug = 'post'

  return `${slug}-${nanoid()}`
}
