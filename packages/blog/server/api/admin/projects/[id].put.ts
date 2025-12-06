// packages\blog\server\api\admin\projects\[id].put.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { ProjectInput, ProjectUpdateSchema } from '../../../schemas/project'
import getDb from '../../../utils/db'

export default defineEventHandler(async event => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: '缺少 id' })

  const body = await readBody(event)
  let input: ProjectInput
  try {
    input = ProjectUpdateSchema.parse(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: '参数错误', data: e.errors })
  }

  const db = await getDb()
  const [row] = await db('projects')
    .where({ id })
    .update({
      title: input.title,
      description: input.description || null,
      tech_stack: input.techStack || [],
      demo_url: input.demoUrl || null,
      repo_url: input.repoUrl || null,
      cover_image: input.coverImage || null,
      status: input.status,
      priority: input.priority,
      updated_at: db.fn.now(),
    })
    .returning('*')

  if (!row) throw createError({ statusCode: 404, message: '项目不存在' })
  return { success: true, data: row }
})
