// packages\blog\server\database\migrations\20251124112536_migrate_array_to_relational.js

export async function up(knex) {
  await knex.transaction(async trx => {
    // 1. 收集所有出现过的不重复标签
    const rows = await trx('posts').whereNotNull('tags').select('id', 'tags')
    const unique = new Set(rows.flatMap(r => r.tags.map(t => t.toLowerCase().trim())))

    // 2. 批量插入 tags 表（onConflict 忽略已存在）
    const tagInserts = Array.from(unique).map(name => ({ name, slug: name }))
    await trx('tags').insert(tagInserts).onConflict('name').ignore()

    // 3. 一次性把 tags.id 映射读进内存
    const tagMap = await trx('tags')
      .select('id', 'name')
      .then(arr => Object.fromEntries(arr.map(t => [t.name, t.id])))

    // 4. 逐行拆分插入 post_tags（批量 1k 条一次）
    const postTags = []
    for (const row of rows) {
      const postId = row.id // ← 这里漏了
      for (const raw of row.tags) {
        const key = raw.toLowerCase().trim()
        if (tagMap[key]) postTags.push({ post_id: postId, tag_id: tagMap[key] })
      }
    }
    const chunk = 1000
    for (let i = 0; i < postTags.length; i += chunk) {
      await trx('post_tags').insert(postTags.slice(i, i + chunk))
    }

    // 5. 数组列废弃（不移除，仅置空，可回滚）
    await trx.raw('UPDATE posts SET tags = NULL')
  })
}

export async function down(knex) {
  await knex.transaction(async trx => {
    // 把原数组拼回去（posts.tags 仍保留定义）
    const posts = await trx('posts').select('id')
    for (const p of posts) {
      const tags = await trx('tags')
        .join('post_tags', 'tags.id', 'post_tags.tag_id')
        .where('post_tags.post_id', p.id)
        .pluck('tags.name')
      await trx('posts').where('id', p.id).update({ tags })
    }
    await trx.schema.dropTableIfExists('post_tags')
    await trx.schema.dropTableIfExists('tags')
  })
}
