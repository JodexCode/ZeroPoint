<!-- packages/admin/src/layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <!-- 左侧边栏（PC）或抽屉（Mobile） -->
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
        <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
          <el-icon>
            <component :is="getIconComponent(route.meta?.icon)" />
          </el-icon>
          <template #title>
            {{ t(route.meta!.title!) }}
          </template>
        </el-menu-item>
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
        <el-menu-item v-for="route in menuRoutes" :key="route.path" :index="route.path">
          <el-icon>
            <component :is="getIconComponent(route.meta?.icon)" />
          </el-icon>
          <template #title>
            {{ t(route.meta!.title!) }}
          </template>
        </el-menu-item>
      </el-menu>
    </el-drawer>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部栏 -->
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
import { RouterView } from 'vue-router'
import { Fold, Expand, Menu } from '@element-plus/icons-vue'
import LocaleSwitcher from '@/components/LocaleSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import { useAuthStore } from '@/stores/auth'
import { useAdminInfoStore } from '@/stores/adminInfo'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import * as ElementPlusIcons from '@element-plus/icons-vue'

const appName = import.meta.env.VITE_APP_NAME ?? 'Admin'

const { t } = useI18n()
const authStore = useAuthStore()
const adminInfoStore = useAdminInfoStore()
const route = useRoute()

/* 折叠 & 移动端 */
const isCollapsed = ref(false)
const isMobile = ref(false)
const drawerVisible = ref(false)
const showUserOnMobile = ref(false)

const checkIsMobile = () => (isMobile.value = window.innerWidth < 768)

onMounted(() => {
  checkIsMobile()
  // ✅ 删除了以下两行，不再自动调用 loadAdminInfo
  // if (authStore.isAuthenticated) await adminInfoStore.loadAdminInfo()
  window.addEventListener('resize', checkIsMobile)
})
onBeforeUnmount(() => window.removeEventListener('resize', checkIsMobile))

const toggleCollapse = () => (isCollapsed.value = !isCollapsed.value)
const handleMobileMenuSelect = () => (drawerVisible.value = false)

/* 图标映射 */
const getIconComponent = (iconName?: string) =>
  iconName ? (ElementPlusIcons as any)[iconName] : undefined

/* 菜单计算 */
function isValidMenuRoute(
  route: any
): route is { path: string; meta: { menu: true; title: string; icon?: string } } {
  return route.meta?.menu === true && typeof route.meta.title === 'string'
}
const menuRoutes = computed(() => {
  const layout = route.matched.find(r => r.path === '/')
  if (!layout?.children) return []
  return layout.children.filter(isValidMenuRoute).map(child => ({
    ...child,
    path: child.path.startsWith('/') ? child.path : `/${child.path}`,
  }))
})
const activeMenu = computed(() => {
  const fullPath = route.path
  for (const item of menuRoutes.value) if (fullPath === item.path) return item.path
  if (fullPath.startsWith('/articles/')) return '/articles'
  return '/'
})
const currentPageTitle = computed(() => {
  const item = menuRoutes.value.find(r => r.path === activeMenu.value)
  return item ? t(item.meta!.title!) : t('common.welcome')
})

/* 头像/昵称 */
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

  @media (max-width: 767px) {
    flex: 1;
  }
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
