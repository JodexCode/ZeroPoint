// packages\blog\server\schemas\profile.ts
import { z } from 'zod'

export const SocialSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1).max(64),
  icon: z.string().url(),
  url: z.string().url(),
  sort_order: z.number().int().default(0),
})

export const ProfileTagSchema = z.object({
  id: z.number().int().optional(),
  text: z.string().min(1).max(16),
  sort_order: z.number().int().default(0),
})

export const ProfileSchema = z.object({
  author_name: z.string().min(1).max(64),
  bio: z.string().min(1).max(200),
  about_me: z.string(),
  icp: z.string().max(100).optional(),
  police: z.string().max(100).optional(),
})

export type Social = z.infer<typeof SocialSchema>
export type ProfileTag = z.infer<typeof ProfileTagSchema>
export type Profile = z.infer<typeof ProfileSchema>
