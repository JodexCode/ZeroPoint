// packages\admin\src\types\post.ts
// packages/admin/src/types/post.ts

/* =============== 标签 =============== */
export interface TagItem {
  id: number
  name: string
  slug: string
  cover_url: string | null
  used: number
}

/* =============== 列表单项 =============== */
export interface PostItemRaw {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  views: number
  created_at: string
  updated_at: string
  series_id: string | null
  series_order: number
  tags?: string[] // 后端返回 json_agg
  excerpt: string | null
  content?: string // 详情才有，列表可无
  cover_image?: string | null
}

/* =============== 分页包装 =============== */
export interface PostsListResponse {
  posts: PostItemRaw[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/* =============== 创建/更新参数 =============== */
export interface PostCreateParams {
  title: string
  content: string
  excerpt?: string
  coverImage?: string | null
  status: 'draft' | 'published'
  tags?: string[]
}

export interface PostUpdateParams {
  title?: string
  content?: string
  excerpt?: string
  coverImage?: string | null
  status?: 'draft' | 'published'
  tags?: string[]
}

/* =============== 创建成功回包 =============== */
export interface CreatedPostData {
  id: string
  title: string
  slug: string
  status: 'draft' | 'published'
  createdAt: string // 后端驼峰
}

export interface UploadSign {
  uploadUrl: string
  fileUrl: string
  key: string
}
