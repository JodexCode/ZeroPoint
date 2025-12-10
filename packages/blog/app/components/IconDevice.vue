<template>
  <!-- 接收外部 class 并绑定到真实 svg 元素 -->
  <svg
    :class="$attrs.class"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <use :href="`#icon-${name}`" />
  </svg>

  <!-- 符号集合：16×16 统一坐标 -->
  <svg style="display: none">
    <symbol id="icon-phone" viewBox="0 0 16 16">
      <rect x="3" y="1" width="10" height="14" rx="2" ry="2" />
      <circle cx="8" cy="12" r="0.8" />
    </symbol>

    <symbol id="icon-cog" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="2" />
      <path d="M13 8a5 5 0 0 0-5-5v5h5zM3 8a5 5 0 0 1 5 5V8H3z" />
    </symbol>

    <symbol id="icon-wifi" viewBox="0 0 16 16">
      <path d="M1 8a7 7 0 0 1 14 0M3.5 8a4.5 4.5 0 0 1 9 0M6 8a2 2 0 0 1 4 0M8 11a1 1 0 0 1 2 0" />
    </symbol>

    <symbol id="icon-gauge" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4v4l3 2" />
    </symbol>

    <symbol id="icon-close" viewBox="0 0 16 16">
      <path d="M12 4L4 12M4 4l8 8" />
    </symbol>
  </svg>
</template>

<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<style scoped>
.icon-device {
  flex-shrink: 0;
  color: inherit;
}
</style>
