// packages\blog\server\database\seeds\admin_user.js

import bcrypt from 'bcrypt'

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // 清空表
  await knex('admins').del()

  const username = process.env.ADMIN_USERNAME || 'admin'
  const plainPassword = process.env.ADMIN_PASSWORD || 'password'
  const hash = await bcrypt.hash(plainPassword, 10)

  await knex('admins').insert({
    username,
    password_hash: hash,
    created_at: new Date(),
    updated_at: new Date(),
  })
}
