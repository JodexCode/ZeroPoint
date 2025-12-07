// packages\blog\server\utils\profileService.ts
import type { Profile, Social, ProfileTag } from '../schemas/profile'
import { query } from './db'

/* -------- 主资料 (Profile) -------- */

export async function getProfile(): Promise<Profile & { id: number }> {
  const res = await query('SELECT * FROM profile LIMIT 1')
  return res.rows[0] || null
}

export async function updateProfile(data: Profile): Promise<void> {
  const { author_name, bio, about_me, icp, police } = data
  await query(
    `
      UPDATE profile
      SET author_name = $1, bio = $2, about_me = $3, icp = $4, police = $5
      WHERE id = 1
    `,
    [author_name, bio, about_me, icp ?? null, police ?? null]
  )
}

/* -------- 社交媒体 (Socials) -------- */

export async function listSocials(): Promise<Social[]> {
  const res = await query('SELECT * FROM socials ORDER BY sort_order ASC')
  return res.rows
}

export async function createSocial(s: Omit<Social, 'id'>): Promise<number> {
  const { name, icon, url, sort_order } = s
  const res = await query(
    `
      INSERT INTO socials (name, icon, url, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
    [name, icon, url, sort_order]
  )
  return res.rows[0].id
}

export async function updateSocial(id: number, s: Partial<Social>): Promise<void> {
  // 动态构建 SET 子句（避免更新 undefined 字段）
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (s.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(s.name)
  }
  if (s.icon !== undefined) {
    fields.push(`icon = $${paramIndex++}`)
    values.push(s.icon)
  }
  if (s.url !== undefined) {
    fields.push(`url = $${paramIndex++}`)
    values.push(s.url)
  }
  if (s.sort_order !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`)
    values.push(s.sort_order)
  }

  if (fields.length === 0) return

  values.push(id) // WHERE id = $N
  await query(`UPDATE socials SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values)
}

export async function deleteSocial(id: number): Promise<void> {
  await query('DELETE FROM socials WHERE id = $1', [id])
}

/* -------- 个人标签 (Profile Tags) -------- */

export async function listProfileTags(): Promise<ProfileTag[]> {
  const res = await query('SELECT * FROM profile_tags ORDER BY sort_order ASC')
  return res.rows
}

export async function createProfileTag(t: Omit<ProfileTag, 'id'>): Promise<number> {
  const { text, sort_order } = t
  const res = await query(
    `
      INSERT INTO profile_tags (text, sort_order)
      VALUES ($1, $2)
      RETURNING id
    `,
    [text, sort_order]
  )
  return res.rows[0].id
}

export async function updateProfileTag(id: number, t: Partial<ProfileTag>): Promise<void> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (t.text !== undefined) {
    fields.push(`text = $${paramIndex++}`)
    values.push(t.text)
  }
  if (t.sort_order !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`)
    values.push(t.sort_order)
  }

  if (fields.length === 0) return

  values.push(id)
  await query(`UPDATE profile_tags SET ${fields.join(', ')} WHERE id = $${paramIndex}`, values)
}

export async function deleteProfileTag(id: number): Promise<void> {
  await query('DELETE FROM profile_tags WHERE id = $1', [id])
}
