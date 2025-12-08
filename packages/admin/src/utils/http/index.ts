// src/utils/http/index.ts
import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios'
import type { ApiResponse } from './types'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { useAuthStore } from '@/stores/auth'

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3000' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
})

// 请求拦截器（可选）
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => config,
  (error: AxiosError) => Promise.reject(error)
)

// 响应拦截器：统一处理错误
http.interceptors.response.use(
  response => response.data,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as ApiResponse
      const url = error.config?.url || ''

      if (status === 400 && data?.data?.errors?.length) {
        ElMessage.error(data.data.errors[0])
      } else if (status === 401) {
        const authStore = useAuthStore()

        if (url.includes('/api/login')) {
          // 登录接口：账号密码错误
          ElMessage.error('用户名或密码错误')
        } else {
          // 其他接口：登录状态失效
          ElMessage.error('登录已过期，请重新登录')
          authStore.handleAuthError() //  清空状态 + 跳转
        }
      } else {
        ElMessage.error(data?.message || `请求失败 (${status})`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }

    return Promise.reject(error)
  }
)

export default http
