// packages/blog/server/api/admin/projects/[id].put.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { ProjectInput, ProjectUpdateSchema } from '../../../schemas/project'
import { query } from '../../../utils/db' // ← 统一使用标准 query

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, message: '缺少 id' })
  }

  const body = await readBody(event)
  let input: ProjectInput
  try {
    input = ProjectUpdateSchema.parse(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: '参数错误', data: e.errors })
  }

  // 执行更新
  const res = await query(
    `
      UPDATE projects
      SET
        title = $1,
        description = $2,
        tech_stack = $3,
        demo_url = $4,
        repo_url = $5,
        cover_image = $6,
        status = $7,
        priority = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `,
    [
      input.title,
      input.description || null,
      input.techStack || [], // pg 自动处理数组
      input.demoUrl || null,
      input.repoUrl || null,
      input.coverImage || null,
      input.status,
      input.priority,
      id,
    ]
  )

  const row = res.rows[0]

  if (!row) {
    throw createError({ statusCode: 404, message: '项目不存在' })
  }

  return { success: true, data: row }
})
