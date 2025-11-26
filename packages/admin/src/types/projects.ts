export interface ProjectItem {
  id: string
  title: string
  slug: string
  description?: string
  tech_stack: string[]
  demo_url?: string | null
  repo_url?: string | null
  cover_image?: string | null
  status: 'draft' | 'published'
  priority: number
  createdAt: string
  updatedAt: string
}

export interface ProjectCreateParams {
  title: string
  description?: string
  techStack?: string[]
  demoUrl?: string | null
  repoUrl?: string | null
  coverImage?: string | null
  status?: 'draft' | 'published'
  priority?: number
}

export interface ProjectUpdateParams extends ProjectCreateParams {}

export interface ProjectListResponse {
  rows: ProjectItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface UploadSign {
  uploadUrl: string
  fileUrl: string
  key: string
}
