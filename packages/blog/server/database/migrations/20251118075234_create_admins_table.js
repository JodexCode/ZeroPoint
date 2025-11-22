// packages\blog\server\database\migrations\20251118075234_create_admins_table.js

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable('admins', table => {
    table.increments('id').primary()
    table.string('username').notNullable().unique()
    table.string('password_hash').notNullable()
    table.timestamps(true, true) // created_at, updated_at
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('admins')
}
