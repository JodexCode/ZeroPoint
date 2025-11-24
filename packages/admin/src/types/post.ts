// ------------------ 类型定义 ------------------

/**
 * 从数据库直接返回的文章类型（含 created_at, updated_at）
 */
export interface PostItemRaw {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published'
  views: number
  created_at: string
  updated_at: string
  tags: string[]
  excerpt: string | null
  content?: string
  cover_image?: string | null
}

/**
 * 创建文章成功后返回的简化数据（注意 createdAt 是 camelCase）
 */
export interface CreatedPostData {
  id: number
  title: string
  slug: string
  status: 'draft' | 'published'
  createdAt: string // 注意这里是 createdAt，对应后端返回
}

export interface PostCreateParams {
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  status: 'draft' | 'published'
  tags?: string[]
}

export interface PostUpdateParams {
  title?: string
  content?: string
  excerpt?: string
  coverImage?: string
  status?: 'draft' | 'published'
  tags?: string[]
}

export interface PostsListResponse {
  posts: PostItemRaw[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
