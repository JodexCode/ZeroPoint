// packages/blog/server/database/seeds/categories.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  await knex('categories').del()

  await knex('categories').insert([
    {
      name: '未分类',
      slug: 'uncategorized',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])
}
