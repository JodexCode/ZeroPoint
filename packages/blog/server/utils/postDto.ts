// packages/blog/server/utils/postDto.ts

export function getPostSelectFields(): string {
  return `
    posts.id,
    posts.title,
    posts.slug,
    posts.excerpt,
    posts.content,
    posts.cover_image,
    posts.status,
    posts.views,
    posts.created_at,
    posts.updated_at,
    posts.series_id,
    posts.series_order,
    COALESCE(
      (
        SELECT json_agg(tags.name ORDER BY tags.name)
        FROM post_tags
        JOIN tags ON tags.id = post_tags.tag_id
        WHERE post_tags.post_id = posts.id
      ),
      '[]'
    ) AS tags
  `
}
