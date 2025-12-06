<template>
  <div class="app">
    <NavBar />
    <main class="content">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.app {
  min-height: 100vh; /* 1. 至少一屏高 */
  display: flex; /* 2. flex 列布局 */
  flex-direction: column;
}
.content {
  flex: 1; /* 3. 剩余空间全部给主内容 */
}
</style>
