<!-- packages/blog/app/layouts/default.vue -->
<template>
  <div class="app">
    <NavBar />
    <main class="content">
      <slot />
    </main>
    <AppFooter />

    <!-- 全局设备信息卡片 -->
    <DeviceInfoCard v-model="visible" :info="info" :x="pos.x" :y="pos.y" />
  </div>
</template>

<script setup lang="ts">
const { visible, info, pos } = useDeviceInfo()
</script>

<style scoped lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.content {
  flex: 1;
}
</style>
