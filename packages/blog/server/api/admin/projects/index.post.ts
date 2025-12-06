// packages\blog\server\api\admin\projects\index.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { ProjectCreateSchema, ProjectInput } from '../../../schemas/project'
import getDb from '../../../utils/db'
import { slugify } from '../../../utils/slugify'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  let input: ProjectInput
  try {
    input = ProjectCreateSchema.parse(body)
  } catch (e: any) {
    throw createError({ statusCode: 400, message: '参数错误', data: e.errors })
  }

  const db = await getDb()

  /* 生成唯一 slug */
  let slug = slugify(input.title)
  let exists,
    cnt = 0
  do {
    exists = await db('projects').where({ slug }).first()
    if (exists) slug = slugify(input.title) + '-' + ++cnt
  } while (exists && cnt < 5)
  if (exists) throw createError({ statusCode: 500, message: '无法生成唯一 slug' })

  const [row] = await db('projects')
    .insert({
      title: input.title,
      slug,
      description: input.description || null,
      tech_stack: input.techStack || [],
      demo_url: input.demoUrl || null,
      repo_url: input.repoUrl || null,
      cover_image: input.coverImage || null,
      status: input.status,
      priority: input.priority,
    })
    .returning(['id', 'slug', 'created_at'])

  return { success: true, data: row }
})
