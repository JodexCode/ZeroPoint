// packages/blog/server/database/migrations/20251123224921_replace_categories_with_series.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Step 1: 从 posts 表移除 category_id（如果有）
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('category_id')
  })

  // Step 2: 删除 categories 表
  await knex.schema.dropTableIfExists('categories')

  // Step 3: 创建 series 表（合集）
  await knex.schema.createTable('series', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('title').notNullable()
    table.text('description')
    table.string('slug').notNullable().unique()
    table.integer('sort_order').defaultTo(0) // 合集在列表中的排序
    table.timestamps(true, true) // created_at, updated_at
  })

  // Step 4: 给 posts 表添加合集关联字段
  await knex.schema.alterTable('posts', table => {
    table.uuid('series_id').references('id').inTable('series').onDelete('SET NULL') // 删除合集时，文章不受影响

    table.integer('series_order').defaultTo(0) // 文章在合集中的顺序
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // 回滚：先恢复 posts 表结构
  await knex.schema.alterTable('posts', table => {
    table.dropColumn('series_order')
    table.dropColumn('series_id')
  })

  // 删除 series 表
  await knex.schema.dropTableIfExists('series')

  // 重新创建 categories 表（原结构）
  await knex.schema.createTable('categories', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('name').notNullable().unique()
    table.string('slug').notNullable().unique()
    table.timestamps(true, true)
  })

  // 恢复 posts.category_id
  await knex.schema.alterTable('posts', table => {
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL')
  })
}
