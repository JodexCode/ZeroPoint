export interface ProfileDto {
  author_name: string
  bio: string
  about_me: string
  icp?: string
  police?: string
}

export interface SocialItem {
  id: number
  name: string
  icon: string
  url: string
  sort_order: number
}

export interface ProfileTagItem {
  id: number
  text: string
  sort_order: number
}

export type SocialCreateParams = Omit<SocialItem, 'id'>
export type ProfileTagCreateParams = Omit<ProfileTagItem, 'id'>
