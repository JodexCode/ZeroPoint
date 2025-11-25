export async function up(knex) {
  await knex.schema.alterTable('posts', t => t.dropColumn('tags'))
}
export async function down(knex) {
  await knex.schema.alterTable('posts', t => t.specificType('tags', 'text[]'))
}
