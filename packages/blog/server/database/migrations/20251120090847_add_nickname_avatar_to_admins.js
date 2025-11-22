// packages/blog/server/database/migrations/20251120170500_add_nickname_avatar_to_admins.js
export async function up(knex) {
  return knex.schema.alterTable('admins', table => {
    table.string('nickname').nullable()
    table.string('avatar_url').nullable()
  })
}

export async function down(knex) {
  return knex.schema.alterTable('admins', table => {
    table.dropColumn('avatar_url')
    table.dropColumn('nickname')
  })
}
