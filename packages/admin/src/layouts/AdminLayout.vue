<!-- packages/admin/src/layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- 左侧边栏（PC） -->
    <aside v-if="!isMobile" class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
      <div class="logo-section">
        <div class="logo" :class="{ 'logo-collapsed': isCollapsed }">{{ appName }}</div>
        <el-button text size="small" class="collapse-btn" @click="toggleCollapse">
          <el-icon>
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
        </el-button>
      </div>

      <el-menu
        :default-active="activeMenu"
        router
        background-color="var(--bg-color)"
        text-color="var(--text-secondary)"
        active-text-color="var(--el-color-primary)"
        :collapse="isCollapsed"
        :collapse-transition="false"
      >
        <template v-for="item in processedMenuRoutes" :key="item.fullPath">
          <el-sub-menu v-if="item.children && item.children.length" :index="item.fullPath">
            <template #title>
              <el-icon>
                <component :is="getIconComponent(item.meta.icon)" />
              </el-icon>
              <span>{{ t(item.meta.title) }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.fullPath"
              :index="child.fullPath"
            >
              {{ t(child.meta.title) }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.fullPath">
            <el-icon>
              <component :is="getIconComponent(item.meta.icon)" />
            </el-icon>
            <template #title>
              {{ t(item.meta.title) }}
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <!-- 移动端抽屉 -->
    <el-drawer
      v-else
      v-model="drawerVisible"
      direction="ltr"
      size="240px"
      :with-header="false"
      custom-class="mobile-sidebar-drawer"
    >
      <div class="logo-section mobile">
        <div class="logo">{{ appName }}</div>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="var(--sidebar-bg)"
        text-color="var(--text-secondary)"
        active-text-color="var(--el-color-primary)"
        @select="handleMobileMenuSelect"
      >
        <template v-for="item in processedMenuRoutes" :key="item.fullPath">
          <el-sub-menu v-if="item.children && item.children.length" :index="item.fullPath">
            <template #title>
              <el-icon>
                <component :is="getIconComponent(item.meta.icon)" />
              </el-icon>
              <span>{{ t(item.meta.title) }}</span>
            </template>
            <el-menu-item
              v-for="child in item.children"
              :key="child.fullPath"
              :index="child.fullPath"
            >
              {{ t(child.meta.title) }}
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="item.fullPath">
            <el-icon>
              <component :is="getIconComponent(item.meta.icon)" />
            </el-icon>
            <template #title>
              {{ t(item.meta.title) }}
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-drawer>

    <!-- 主内容区 -->
    <main class="main-content">
      <header class="topbar">
        <div class="mobile-menu-trigger" v-if="isMobile" @click="drawerVisible = true">
          <el-icon><Menu /></el-icon>
        </div>

        <div class="tabs-container">
          <span class="current-page-title">{{ currentPageTitle }}</span>
        </div>

        <div class="controls">
          <LocaleSwitcher />
          <ThemeToggle />
          <el-dropdown v-if="!isMobile || showUserOnMobile" trigger="click" placement="bottom-end">
            <div class="user-info">
              <el-avatar size="small" :src="userAvatar" />
              <span v-if="!isMobile" class="username">{{ userDisplayName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  {{ t('common.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <div class="page-container">
        <RouterView v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { Fold, Expand, Menu } from '@element-plus/icons-vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminInfoStore } from '@/stores/adminInfo'
import { useI18n } from 'vue-i18n'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const appName = import.meta.env.VITE_APP_NAME ?? 'Admin'

interface MenuItem {
  path: string
  fullPath: string
  meta: {
    menu: true
    title: string
    icon?: string
  }
  children?: MenuItem[]
}

const { t } = useI18n()
const authStore = useAuthStore()
const adminInfoStore = useAdminInfoStore()
const route = useRoute()

// 响应式状态
const isCollapsed = ref(false)
const isMobile = ref(false)
const drawerVisible = ref(false)
const showUserOnMobile = ref(false)

// 工具函数
const checkIsMobile = () => (isMobile.value = window.innerWidth < 768)

onMounted(() => {
  checkIsMobile()
  window.addEventListener('resize', checkIsMobile)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', checkIsMobile)
})

const toggleCollapse = () => (isCollapsed.value = !isCollapsed.value)
const handleMobileMenuSelect = () => (drawerVisible.value = false)

const getIconComponent = (iconName?: string) =>
  iconName ? (ElementPlusIcons as any)[iconName] : undefined

// 判断是否为有效菜单项
function isValidMenuRoute(route: any): route is { path: string; meta: any; children?: any[] } {
  return route.meta?.menu === true && typeof route.meta.title === 'string'
}

// 递归构建带 fullPath 的菜单树（最多两层，符合 el-menu）
const buildMenuItems = (routes: any[], parentPath = ''): MenuItem[] => {
  return routes.filter(isValidMenuRoute).map(r => {
    const currentPath = r.path.startsWith('/') ? r.path : `/${r.path}`
    const fullPath = parentPath ? `${parentPath}${currentPath}` : currentPath

    let children: MenuItem[] | undefined
    if (Array.isArray(r.children) && r.children.length > 0) {
      children = buildMenuItems(r.children, fullPath).filter(child => child.meta.menu)
      if (children.length === 0) children = undefined
    }

    return {
      path: r.path,
      fullPath,
      meta: r.meta,
      children,
    }
  })
}

// 获取根路由下的菜单
const processedMenuRoutes = computed(() => {
  const layout = route.matched.find(r => r.path === '/')
  return layout?.children ? buildMenuItems(layout.children) : []
})

// 当前激活菜单项（用于高亮）
const activeMenu = computed(() => {
  const currentPath = route.path

  // 文章相关页面统一高亮到 /articles
  if (/^\/articles(\/|$)/.test(currentPath)) {
    return '/articles'
  }

  // 遍历所有菜单项（包括子项）找匹配
  for (const item of processedMenuRoutes.value) {
    if (currentPath === item.fullPath) return item.fullPath
    if (item.children) {
      for (const child of item.children) {
        if (currentPath === child.fullPath) return child.fullPath
      }
    }
  }

  return '/' // 默认高亮 Dashboard
})

// 当前页面标题：优先使用当前路由 meta.title，否则回退到菜单项
const currentPageTitle = computed(() => {
  // 1. 如果当前路由有 meta.title，直接使用（支持动态翻译）
  if (route.meta.title) {
    return t(route.meta.title as string)
  }

  // 2. 否则尝试从菜单中匹配（用于 Dashboard 等）
  for (const item of processedMenuRoutes.value) {
    if (activeMenu.value === item.fullPath) {
      return t(item.meta.title)
    }
    if (item.children) {
      for (const child of item.children) {
        if (activeMenu.value === child.fullPath) {
          return t(child.meta.title)
        }
      }
    }
  }

  // 3. 默认兜底
  return t('common.welcome')
})

// 用户信息
const userAvatar = computed(() => adminInfoStore.displayAvatar)
const userDisplayName = computed(() => adminInfoStore.displayName)

const handleLogout = () => {
  authStore.logout()
  if (isMobile.value) drawerVisible.value = false
}
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  @media (max-width: 767px) {
    flex-direction: column;
  }
}

/* ========== PC Sidebar ========== */
.sidebar {
  width: 220px;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;

  &.sidebar-collapsed {
    width: 64px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 12px;
    transition: padding 0.25s ease;

    .logo {
      font-weight: bold;
      font-size: 22px;
      color: var(--primary-color);
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transform: translateX(0);
    }

    .logo.logo-collapsed {
      opacity: 0;
      transform: translateX(-10px);
      width: 0;
      margin-right: 0 !important;
    }

    .collapse-btn {
      color: var(--primary-color);
      margin-left: auto;
      font-size: 20px;
      &:hover {
        color: var(--el-color-primary, var(--primary-color)) !important;
        background-color: rgba(102, 126, 234, 0.08) !important;
      }
    }
  }

  :deep(.el-menu) {
    border: none;
    .el-sub-menu .el-menu {
      background-color: var(--bg-color);
    }
  }
}

.sidebar.sidebar-collapsed .logo-section {
  padding: 0 8px;
}

/* ========== Mobile Drawer ========== */
:deep(.mobile-sidebar-drawer) {
  .el-drawer__body {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .logo-section.mobile {
    height: 60px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color);
    background-color: var(--sidebar-bg);

    .logo {
      font-weight: bold;
      font-size: 20px;
      color: var(--primary-color);
    }
  }

  .el-menu {
    flex: 1;
    border-right: none !important;
    background-color: var(--sidebar-bg) !important;
  }
}

/* ========== Main Content ========== */
.main-content {
  background-color: var(--main-bg);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--bg-color);
  border-bottom: 1px solid var(--el-border-color);

  @media (max-width: 767px) {
    padding: 0 12px;
  }

  .mobile-menu-trigger {
    display: none;
    margin-right: 12px;
    font-size: 20px;
    color: var(--text-primary);
    cursor: pointer;

    @media (max-width: 767px) {
      display: block;
    }
  }

  .tabs-container {
    height: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    margin-right: 16px;
    margin-left: -16px;
    position: relative;

    @media (max-width: 767px) {
      margin-right: 8px;
      margin-left: -12px;
    }

    .current-page-title {
      background-color: var(--main-bg);
      color: var(--text-primary);
      font-size: 18px;
      position: relative;
      z-index: 2;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-inline: 20px;
      border-right: 1px solid var(--el-border-color);

      @media (max-width: 767px) {
        font-size: 16px;
        padding-inline: 16px;
        margin-left: 20px;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 0;
        right: 0;
        height: 2px;
        background-color: var(--main-bg);
        z-index: 1;
      }
    }
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 767px) {
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .username {
        color: var(--text-primary);
        font-size: 14px;
      }
    }
  }
}

.page-container {
  flex: 1;
  overflow-y: auto;
  background-color: var(--main-bg);
}
</style>
