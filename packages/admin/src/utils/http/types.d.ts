// src/http/types.ts

export interface ApiSuccessResponse<T = any> {
  success: true
  message: string
  data?: T
}

export interface ApiErrorResponse {
  success: false
  statusCode: number
  message: string
  data?: {
    errors?: string[] // ← 关键：扁平错误数组
    [key: string]: any
  }
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse
