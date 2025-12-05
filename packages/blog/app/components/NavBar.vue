<template>
  <header class="navbar">
    <div class="navbar-inner">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="pulse">{{ title[0] }}</span>
        <span>{{ title[1] }}</span>
      </NuxtLink>

      <!-- 桌面导航 -->
      <nav class="nav-desktop">
        <NuxtLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-link"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.name }}
        </NuxtLink>
        <ThemeSwitch />
      </nav>

      <!-- 移动端右侧 -->
      <div class="nav-mobile-right">
        <ThemeSwitch />
        <button class="hamburger" @click="isOpen = !isOpen" aria-label="toggle menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="hamburger-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              v-if="!isOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端抽屉 -->
    <Transition name="drawer">
      <div v-if="isOpen" class="mobile-drawer">
        <nav class="mobile-nav">
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="mobile-link"
            :class="{ active: isActive(item.path) }"
            @click="isOpen = false"
          >
            {{ item.name }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { AppName } from '@/config'

const route = useRoute()
const isOpen = ref(false)

const title = [AppName.name1, AppName.name2]

const navItems = [
  { name: '博客', path: '/blog' },
  { name: '项目集', path: '/projects' },
  // { name: '时间轴', path: '/timeline' },
  // { name: '技术栈', path: '/tech-stack' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* ===== 基础变量 ===== */
.navbar {
  position: sticky;
  top: 0;
  z-index: 99999;
  height: 56px;
  background: var(--nav-bg);
  backdrop-filter: blur(4px);
  box-shadow: var(--box-shadow);
}

.navbar-inner {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  /* gap: 0.25rem; */
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.pulse {
  display: inline-block;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.nav-desktop {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: var(--text);
  text-decoration: none;
  transition: color 0.25s;
}

.nav-link:hover,
.nav-link.active {
  color: var(--primary);
}

.nav-mobile-right {
  display: none;
  align-items: center;
  gap: 0.75rem;
}

.hamburger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: var(--text);
}

.hamburger-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.mobile-drawer {
  display: none;
  padding: 0.75rem 1rem;
  background: var(--nav-bg);
  border-top: 1px solid var(--border, rgba(0, 0, 0, 0.08));
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-link {
  color: var(--text);
  text-decoration: none;
  padding: 0.5rem 0;
  transition: color 0.25s;
}

.mobile-link:hover,
.mobile-link.active {
  color: var(--primary);
}

.mobile-usermenu {
  margin-top: 0.5rem;
}

/* ===== 响应式断点 768px ===== */
@media (max-width: 768px) {
  .nav-desktop {
    display: none;
  }
  .nav-mobile-right {
    display: flex;
  }
  .mobile-drawer {
    display: block;
  }
}

/* ===== 抽屉动画 ===== */
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.25s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
