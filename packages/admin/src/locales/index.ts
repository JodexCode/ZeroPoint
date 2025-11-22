// src/locales/index.ts
import { createI18n } from 'vue-i18n'
import { useLocaleStore } from '@/stores/locale'

// 创建 i18n 实例（不传初始 messages）
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN', // 临时值，会被覆盖
  fallbackLocale: 'zh-CN',
  messages: {},
})

// 动态加载 messages 并同步 locale
export const setupI18n = async () => {
  const localeStore = useLocaleStore()

  // 加载翻译文件（如果还没加载）
  if (!i18n.global.availableLocales.includes('zh-CN')) {
    const zhCN = await import('@/locales/zh-CN.json')
    const enUS = await import('@/locales/en-US.json')
    i18n.global.setLocaleMessage('zh-CN', zhCN.default)
    i18n.global.setLocaleMessage('en-US', enUS.default)
  }

  // 同步当前语言
  i18n.global.locale.value = localeStore.current

  // 监听 Pinia 变化，同步到 i18n
  localeStore.$subscribe((mutation, state) => {
    i18n.global.locale.value = state.current
  })
}

export default i18n
