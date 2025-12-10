<!-- packages/blog/app/layouts/default.vue -->
<template>
  <div class="app">
    <NavBar />
    <main class="content">
      <slot />
    </main>
    <AppFooter />

    <!-- 全局设备信息卡片 -->
    <ClientOnly>
      <DeviceInfoCard v-model="visible" :info="info" :x="pos.x" :y="pos.y" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// 💡 只在客户端调用 useDeviceInfo

const { visible, info, pos } = process.client
  ? useDeviceInfo()
  : {
      visible: ref(false),
      info: reactive({
        deviceModel: '',
        systemVersion: '',
        networkType: '',
        networkSpeed: '',
      }),
      pos: ref({ x: 0, y: 0 }),
    }
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
