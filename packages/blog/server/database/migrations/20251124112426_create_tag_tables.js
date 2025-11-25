// packages\blog\server\database\migrations\20251124112426_create_tag_tables.js

export async function up(knex) {
  // 1. 主标签表
  await knex.schema.createTable('tags', table => {
    table.increments('id').primary()
    table.text('name').notNullable().unique() // 原始显示名
    table.text('slug').notNullable().unique() // URL 用
    table.text('cover_url') // 封面
    table.text('seo_desc') // SEO 描述
    table.integer('sort_order').defaultTo(0)
    table.timestamps(true, true)
  })

  // 2. 文章<->标签 多对多
  await knex.schema.createTable('post_tags', table => {
    table.increments('id').primary()
    table.uuid('post_id').notNullable().references('id').inTable('posts').onDelete('CASCADE')
    table.integer('tag_id').notNullable().references('id').inTable('tags').onDelete('CASCADE')
    table.unique(['post_id', 'tag_id']) // 复合唯一，防重复
  })

  // 3. 性能索引
  await knex.raw('CREATE INDEX idx_post_tags_tagid_postid ON post_tags(tag_id, post_id)')
  await knex.raw('CREATE INDEX idx_post_tags_postid_tagid ON post_tags(post_id, tag_id)')
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('post_tags')
  await knex.schema.dropTableIfExists('tags')
}
