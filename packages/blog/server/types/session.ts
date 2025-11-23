// packages/blog/server/types/session.ts
import { z } from 'zod'

export const AdminSessionDataSchema = z.object({
  adminId: z.number().int(),
  username: z.string().min(1),
  nickname: z.string().optional(),
  avatarUrl: z.string().nullable().optional(), // 允许 null 或 undefined
  createdAt: z.number().int(),
})

export type AdminSessionData = z.infer<typeof AdminSessionDataSchema>
