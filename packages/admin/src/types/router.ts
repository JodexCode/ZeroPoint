// packages/admin/src/types/router.ts
export interface MenuRouteMeta {
  menu?: boolean
  title?: string // i18n key，如 'nav.dashboard'
  icon?: string // Element Plus 图标名，如 'Operation'
}

declare module 'vue-router' {
  interface RouteMeta extends MenuRouteMeta {}
}
