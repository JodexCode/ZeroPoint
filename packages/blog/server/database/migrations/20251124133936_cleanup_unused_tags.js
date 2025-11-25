// packages/blog/server/database/migrations/xxxx_cleanup_unused_tags.js
export async function up(knex) {
  // 1. 清掉没有被引用的标签
  await knex('tags').whereNotIn('id', knex('post_tags').select('tag_id')).del()
}

export async function down(knex) {
  // 2. 回滚：无数据可恢复，留空即可
  //    （如需可再插入默认标签，这里保持空实现）
}
