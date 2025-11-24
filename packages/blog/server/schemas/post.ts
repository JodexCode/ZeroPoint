// packages/blog/server/schemas/post.ts
import { z } from 'zod'

const PostStatusSchema = z.enum(['draft', 'published'])

export const PostCreateSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  content: z.string().min(1, '内容不能为空'),
  status: PostStatusSchema,
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
  excerpt: z.string().max(200).optional(),
  coverImage: z.string().url().optional().nullable(),
})

export const PostUpdateSchema = PostCreateSchema

export type PostInput = z.infer<typeof PostCreateSchema>
