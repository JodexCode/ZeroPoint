<!-- packages/admin/src/views/Dashboard.vue -->
<template>
  <div class="dashboard">
    <p>✅ 登录成功！这是你的仪表盘。</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  // TODO: 调用登出 API（后续可补充）
  // 目前先清除本地状态并跳转回登录页
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  padding: 20px;
}
</style>
