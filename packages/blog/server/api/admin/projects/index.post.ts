// packages/blog/server/api/admin/projects/index.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { ProjectCreateSchema, ProjectInput } from '../../../schemas/project'
import { query } from '../../../utils/db' // ← 正确导入
import { slugify } from '../../..//utils/slugify'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  let input: ProjectInput
  try {
    input = ProjectCreateSchema.parse(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: '参数错误', data: e.errors })
  }

  /* 生成唯一 slug */
  let baseSlug = slugify(input.title)
  let slug = baseSlug
  let exists: boolean
  let cnt = 0

  do {
    const res = await query(`SELECT 1 FROM projects WHERE slug = $1`, [slug])
    exists = res.rows.length > 0
    if (exists) {
      cnt++
      slug = `${baseSlug}-${cnt}`
    }
  } while (exists && cnt < 5)

  if (exists) {
    throw createError({ statusCode: 500, message: '无法生成唯一 slug' })
  }

  // 执行插入
  const insertRes = await query(
    `
      INSERT INTO projects (
        title,
        slug,
        description,
        tech_stack,
        demo_url,
        repo_url,
        cover_image,
        status,
        priority
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, slug, created_at
    `,
    [
      input.title,
      slug,
      input.description || null,
      input.techStack || [], // PostgreSQL 会自动处理 TEXT[] 或 JSONB
      input.demoUrl || null,
      input.repoUrl || null,
      input.coverImage || null,
      input.status,
      input.priority,
    ]
  )

  const row = insertRes.rows[0]

  return { success: true, data: row }
})
