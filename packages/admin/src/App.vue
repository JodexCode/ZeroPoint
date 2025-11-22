<!-- packages/admin/src/App.vue -->
<template>
  <el-config-provider :locale="localeStore.elementPlusLocale">
    <div class="app-wrapper">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'
import { useAuthStore } from '@/stores/auth'

const localeStore = useLocaleStore()

const authStore = useAuthStore()
let refreshInterval: number | null = null

onMounted(() => {
  // 每 5 分钟（300_000ms）静默验证一次登录状态
  refreshInterval = setInterval(() => {
    if (authStore.isAuthenticated) {
      // 注意：这里不 await，也不处理结果，完全静默
      authStore.checkAuth().catch(() => {
        // 即使失败也不提示，checkAuth 内部会自动登出
      })
    }
  }, 300_000) // 5分钟
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style src="@/assets/styles/theme.scss" lang="scss"></style>

<style lang="scss">
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  max-width: 100vw;
}

body {
  background-color: var(--bg-color);
  color: var(--text-color);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
</style>
