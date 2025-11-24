// packages/blog/server/database/migrations/20251123215800_create_posts_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // 1. 创建 categories 表（分类）
  await knex.schema.createTable('categories', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('name').notNullable().unique()
    table.string('slug').notNullable().unique()
    table.timestamps(true, true)
  })

  // 2. 创建 posts 表
  await knex.schema.createTable('posts', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('title').notNullable()
    table.string('slug').notNullable().unique() // URL 友好路径
    table.text('excerpt') // 摘要
    table.text('content').notNullable() // Markdown 内容
    table.string('cover_image') // 封面图 URL
    table.enum('status', ['draft', 'published']).notNullable().defaultTo('draft')
    table.integer('views').notNullable().defaultTo(0) // 浏览量
    table.uuid('category_id').references('id').inTable('categories').onDelete('SET NULL')
    table.specificType('tags', 'text[]') // PostgreSQL 数组类型：["vue", "blog"]
    table.timestamps(true, true) // created_at, updated_at
  })

  // 3. 创建 post_views 表（用于 IP 限频）
  await knex.schema.createTable('post_views', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE')
    table.specificType('ip_address', 'inet').notNullable() // PostgreSQL 的 inet 类型
    table.timestamp('viewed_at').defaultTo(knex.fn.now())
  })

  // 添加索引
  await knex.schema.alterTable('post_views', table => {
    table.index(['post_id', 'ip_address'])
    table.index('viewed_at')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('post_views')
  await knex.schema.dropTableIfExists('posts')
  await knex.schema.dropTableIfExists('categories')
}
