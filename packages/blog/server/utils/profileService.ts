import type { Profile, Social, ProfileTag } from '../schemas/profile'
import getDb from './db'

export async function getProfile() {
  const db = await getDb()
  const row = await db('profile').first()
  return row!
}

export async function updateProfile(data: Profile) {
  const db = await getDb()
  await db('profile').where('id', 1).update(data)
}

/* -------- 社交媒体 -------- */
export async function listSocials() {
  const db = await getDb()
  return db('socials').orderBy('sort_order', 'asc')
}

export async function createSocial(s: Omit<Social, 'id'>) {
  const db = await getDb()
  const [id] = await db('socials').insert(s).returning('id')
  return id as number
}

export async function updateSocial(id: number, s: Partial<Social>) {
  const db = await getDb()
  await db('socials').where({ id }).update(s)
}

export async function deleteSocial(id: number) {
  const db = await getDb()
  await db('socials').where({ id }).del()
}

/* -------- 个人标签 -------- */
export async function listProfileTags() {
  const db = await getDb()
  return db('profile_tags').orderBy('sort_order', 'asc')
}

export async function createProfileTag(t: Omit<ProfileTag, 'id'>) {
  const db = await getDb()
  const [id] = await db('profile_tags').insert(t).returning('id')
  return id as number
}

export async function updateProfileTag(id: number, t: Partial<ProfileTag>) {
  const db = await getDb()
  await db('profile_tags').where({ id }).update(t)
}

export async function deleteProfileTag(id: number) {
  const db = await getDb()
  await db('profile_tags').where({ id }).del()
}
