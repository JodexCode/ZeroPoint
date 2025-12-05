// packages\blog\server\database\migrations\20251205131923_create_profile_tables.js
export async function up(knex) {
  // 1. 主配置表（只有一行）
  await knex.schema.createTable('profile', t => {
    t.increments('id').primary()
    t.string('author_name', 64).notNullable()
    t.string('bio', 200).notNullable() // 一句话简介
    t.text('about_me').notNullable() // Markdown
    t.string('icp', 100) // 闽ICP备xxxx
    t.string('police', 100) // 闽公网安备xxxx
    t.timestamps(true, true)
  })

  // 2. 社交媒体
  await knex.schema.createTable('socials', t => {
    t.increments('id').primary()
    t.string('name', 64).notNullable() // 显示名称
    t.string('icon', 200).notNullable() // 图标 url 或 svg
    t.string('url', 500).notNullable()
    t.integer('sort_order').defaultTo(0)
    t.timestamps(true, true)
  })

  // 3. 个人标签
  await knex.schema.createTable('profile_tags', t => {
    t.increments('id').primary()
    t.string('text', 16).notNullable()
    t.integer('sort_order').defaultTo(0)
    t.timestamps(true, true)
  })

  // 默认插入一条空 profile
  await knex('profile').insert({
    author_name: 'YourName',
    bio: '一句话介绍你自己',
    about_me: '## 关于我\n写一段 Markdown …',
    icp: '',
    police: '',
  })
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('profile_tags')
  await knex.schema.dropTableIfExists('socials')
  await knex.schema.dropTableIfExists('profile')
}
