// server/types/session.ts
export interface AdminSessionData {
  adminId: number
  username: string
  createdAt: number // 时间戳，便于后续加过期逻辑
}
