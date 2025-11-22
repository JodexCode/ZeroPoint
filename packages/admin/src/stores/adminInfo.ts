// src/stores/adminInfo.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCurrentUser, updateNicknameApi } from '@/apis/auth'
import { updateAdminAvatar } from '@/apis/avatar'
import { ElMessage } from 'element-plus'

export const useAdminInfoStore = defineStore('adminInfo', () => {
  const avatar = ref('')
  const nickname = ref('')
  const username = ref('')

  const displayAvatar = computed(() => avatar.value || DEFAULT_AVATAR)
  const displayName = computed(() => nickname.value || username.value || 'Admin')

  let lastFetch = 0

  /**
   * 由 authStore 主动设置用户信息（用于初始化）
   */
  function setAdminInfo(info: { avatar: string; nickname: string; username: string }) {
    avatar.value = info.avatar
    nickname.value = info.nickname
    username.value = info.username
    lastFetch = Date.now() // 标记已加载，避免短时间内重复拉取
  }

  /**
   * 手动刷新管理员信息（如头像更新后调用）
   */
  async function loadAdminInfo() {
    const now = Date.now()
    if (now - lastFetch < 5000) return
    lastFetch = now

    try {
      console.log('admininfo：执行loadAdminInfo来调用me接口')
      const { success, data } = await getCurrentUser()
      if (success && data) {
        avatar.value = data.avatarUrl ?? ''
        nickname.value = data.nickname ?? ''
        username.value = data.username ?? 'Admin'
      }
    } catch {
      ElMessage.error('获取管理员信息失败')
    }
  }

  async function updateAvatar(newUrl: string) {
    await updateAdminAvatar({ avatarUrl: newUrl })
    avatar.value = newUrl
    ElMessage.success('头像已更新')
  }

  function reset() {
    avatar.value = nickname.value = username.value = ''
    lastFetch = 0
  }

  async function updateNickname(newNickname: string) {
    await updateNicknameApi({ nickname: newNickname }) // 上一步的 api
    nickname.value = newNickname
    ElMessage.success('昵称已更新')
  }

  return {
    avatar,
    nickname,
    username,
    displayAvatar,
    displayName,
    setAdminInfo, // ✅ 新增
    loadAdminInfo, // 保留用于手动刷新
    updateAvatar,
    reset,
    updateNickname,
  }
})

const DEFAULT_AVATAR = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
