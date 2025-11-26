import { z } from 'zod'

export const ProjectStatusSchema = z.enum(['draft', 'published'])

export const ProjectCreateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100),
  description: z.string().max(500).optional(),
  techStack: z.array(z.string().max(30)).max(20).optional(),
  demoUrl: z.string().url().optional().nullable(),
  repoUrl: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  status: ProjectStatusSchema.default('draft'),
  priority: z.number().int().min(0).max(999).default(0),
})

export const ProjectUpdateSchema = ProjectCreateSchema

export type ProjectInput = z.infer<typeof ProjectCreateSchema>
