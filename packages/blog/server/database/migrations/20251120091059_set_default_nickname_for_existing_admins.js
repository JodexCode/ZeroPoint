// packages\blog\server\database\migrations\20251120091059_set_default_nickname_for_existing_admins.js
export async function up(knex) {
  // 为所有 nickname 为空的管理员设置默认值
  await knex('admins')
    .whereNull('nickname')
    .update({ nickname: knex.raw('username') })
}

export async function down(knex) {
  // 可选：清空 nickname（一般不需要回滚）
  await knex('admins').update({ nickname: null })
}
