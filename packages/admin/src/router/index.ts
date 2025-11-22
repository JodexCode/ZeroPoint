// packages/admin/src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import '@/types/router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { menu: true, title: 'nav.dashboard', icon: 'Operation' },
      },
      {
        path: 'dashboard',
        redirect: '/', // 避免重复路由
      },
      {
        path: 'articles',
        name: 'ArticleList',
        component: () => import('@/views/articles/List.vue'),
        meta: { menu: true, title: 'nav.articles', icon: 'Document' },
      },
      {
        path: 'articles/new',
        name: 'ArticleCreate',
        component: () => import('@/views/articles/Edit.vue'),
      },
      {
        path: 'articles/:id/edit',
        name: 'ArticleEdit',
        component: () => import('@/views/articles/Edit.vue'),
        props: true,
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { menu: true, title: 'nav.profile', icon: 'User' },
      },
      {
        path: 'system-monitor',
        name: 'SystemMonitor',
        component: () => import('@/views/SystemMonitor.vue'),
        meta: { menu: true, title: 'nav.systemMonitor', icon: 'Monitor' },
      },
    ],
  },
  {
    path: '/not-found',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/not-found',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 🟢 场景1: 访问登录页（guestOnly）
  if (to.meta.guestOnly) {
    // 只看前端状态！避免查后端导致误判
    if (authStore.isAuthenticated) {
      next('/') // 已登录用户不应停留在登录页
    } else {
      next() // 未登录，允许进入
    }
    return
  }

  // 🟢 场景2: 访问其他页面（需认证）
  if (!authStore.isAuthenticated) {
    // 前端无登录状态 → 验证后端是否真的没登录
    const isNowAuthenticated = await authStore.checkAuth()
    if (!isNowAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  // 已认证，放行
  next()
})

export default router
