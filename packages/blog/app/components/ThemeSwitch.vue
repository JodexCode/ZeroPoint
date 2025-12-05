<template>
  <label class="theme-switch" for="theme">
    <!-- 第一次渲染就用 restored 的值，保证滑块和主题同步 -->
    <input id="theme" type="checkbox" :checked="restored" @change="toggle" />
    <span class="slider">
      <span class="icon">{{ restored ? '🌙' : '☀️' }}</span>
    </span>
  </label>
</template>

<script setup lang="ts">
/* 用于页面展示的实时状态 */
const isDark = ref(false)

/* 用于 input:checked 的初始状态，确保和 localStorage 一致 */
const restored = ref(false)

/* 切换函数 */
function toggle() {
  isDark.value = !isDark.value
  setTheme(isDark.value)
}

/* 设置主题并持久化 */
function setTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : '')
  localStorage.setItem('zero-theme', dark ? 'dark' : '')
  // 让展示态和 input 态保持一致
  isDark.value = dark
  restored.value = dark
}

/* 客户端渲染前立即恢复，保证第一次渲染就正确 */
if (process.client) {
  onMounted(() => {
    const saved = localStorage.getItem('zero-theme')
    const dark = saved === 'dark'
    // 同步 DOM 和 data-theme
    setTheme(dark)
  })
}
</script>

<style scoped>
/* 整体开关 */
.theme-switch {
  position: relative;
  display: inline-block;
  width: 48px; /* 原来是 64 */
  height: 24px; /* 原来是 32 */
  cursor: pointer;
  user-select: none;
}
.theme-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  inset: 0;
  background: var(--switch-bg-alpha);
  border-radius: 24px; /* 圆角随高度 */
  transition: background 0.35s;
}
.slider .icon {
  position: absolute;
  left: var(--switch-offset, 2px); /* 默认 2px 空隙 */
  top: var(--switch-offset, 2px);
  height: calc(24px - 2 * var(--switch-offset, 2px)); /* 18px */
  width: calc(24px - 2 * var(--switch-offset, 2px));
  border-radius: 50%;
  background: var(--switch-dot);
  display: grid;
  place-items: center;
  font-size: 12px; /* 图标更小 */
  transition: transform 0.35s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
/* 选中右滑 */
.theme-switch input:checked + .slider {
  background: var(--switch-bg-alpha);
}
.theme-switch input:checked + .slider .icon {
  transform: translateX(24px); /* 移动距离 = 新总宽 - 滑块宽 */
}
</style>
