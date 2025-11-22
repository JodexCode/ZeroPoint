// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getCurrentUser, logoutApi } from '@/apis/auth'
import { useRouter } from 'vue-router'
import { useAdminInfoStore } from '@/stores/adminInfo'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const user = ref<{ adminId: number; username: string } | null>(null)
  const loading = ref(false)
  const lastValidatedAt = ref<number | null>(null)
  const VALIDATION_COOLDOWN = 5000

  const checkAuth = async (force = false) => {
    if (loading.value) return false
    const now = Date.now()
    if (!force && lastValidatedAt.value && now - lastValidatedAt.value < VALIDATION_COOLDOWN) {
      return isAuthenticated.value
    }

    loading.value = true
    try {
      const res = await getCurrentUser()
      if (res.success && res.data) {
        isAuthenticated.value = true
        user.value = {
          adminId: res.data.adminId,
          username: res.data.username,
        }

        // ✅ 关键：同步用户信息到 adminInfoStore
        const adminStore = useAdminInfoStore()
        adminStore.setAdminInfo({
          avatar: res.data.avatarUrl ?? '',
          nickname: res.data.nickname ?? '',
          username: res.data.username ?? 'Admin',
        })

        lastValidatedAt.value = now
        return true
      } else {
        reset()
        return false
      }
    } catch {
      reset()
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch (error) {
      console.warn('Logout API failed, still clearing local state', error)
    } finally {
      reset()
      lastValidatedAt.value = null

      const adminStore = useAdminInfoStore()
      adminStore.reset()

      router.push('/login')
    }
  }

  const reset = () => {
    isAuthenticated.value = false
    user.value = null
  }

  const handleAuthError = async () => {
    await logout()
  }

  return {
    isAuthenticated,
    user,
    loading,
    checkAuth,
    logout,
    handleAuthError,
  }
})
