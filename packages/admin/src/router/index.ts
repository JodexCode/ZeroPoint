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
        redirect: '/',
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
        meta: { menu: false, title: 'article.create' },
      },
      {
        path: 'articles/:id/edit',
        name: 'ArticleEdit',
        component: () => import('@/views/articles/Edit.vue'),
        props: true,
        meta: { menu: false, title: 'article.edit' },
      },
      {
        path: 'projects',
        name: 'Projects',
        component: () => import('@/views/projects/List.vue'),
        meta: { menu: true, title: 'nav.projects', icon: 'Collection' },
      },
      {
        path: 'projects/new',
        name: 'ProjectCreate',
        component: () => import('@/views/projects/Edit.vue'),
        meta: { menu: false, title: 'projects.create' },
      },
      {
        path: 'projects/:id/edit',
        name: 'ProjectEdit',
        component: () => import('@/views/projects/Edit.vue'),
        props: true,
        meta: { menu: false, title: 'projects.edit' },
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

  // 场景1: guestOnly 页面（如登录页）
  if (to.meta.guestOnly) {
    if (authStore.isAuthenticated) {
      next('/')
    } else {
      next()
    }
    return
  }

  // 场景2: 需要认证的页面
  if (!authStore.isAuthenticated) {
    const isNowAuthenticated = await authStore.checkAuth()
    if (!isNowAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }
  }

  next()
})

export default router
