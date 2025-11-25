// packages\blog\server\database\migrations\20251124134707_drop_tags_cover_url.js
export async function up(knex) {
  await knex.schema.alterTable('tags', t => t.dropColumn('cover_url'))
}
export async function down(knex) {
  await knex.schema.alterTable('tags', t => t.text('cover_url'))
}
