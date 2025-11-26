// packages\blog\server\database\migrations\20251126080015_create_projects_table.js
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('projects', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('title').notNullable()
    table.string('slug').notNullable().unique()
    table.text('description')
    table.specificType('tech_stack', 'text[]') // PostgreSQL 字符串数组
    table.string('demo_url')
    table.string('repo_url')
    table.string('cover_image')
    table.enum('status', ['draft', 'published']).notNullable().defaultTo('draft')
    table.integer('priority').notNullable().defaultTo(0) // 优先级排序
    table.timestamps(true, true) // created_at, updated_at
  })

  // 常用索引
  await knex.schema.alterTable('projects', table => {
    table.index('status')
    table.index('priority')
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('projects')
}
