// packages/admin/src/composables/useLocale.ts
import { ref, computed, watch } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import zhCNApp from '@/locales/zh-CN.json'
import enUSApp from '@/locales/en-US.json'

type Language = 'zh-CN' | 'en-US'

export const useLocale = () => {
  const localeRef = ref<Language>((localStorage.getItem('ADMIN_LOCALE') as Language) || 'zh-CN')

  const elementPlusLocale = computed(() => {
    return localeRef.value === 'zh-CN' ? zhCn : en
  })

  const appLocale = computed(() => {
    return localeRef.value === 'zh-CN' ? zhCNApp : enUSApp
  })

  watch(
    localeRef,
    lang => {
      localStorage.setItem('ADMIN_LOCALE', lang)
      document.documentElement.setAttribute('lang', lang.replace('-', '_')) // 'zh-CN' → 'zh_CN' for HTML
    },
    { immediate: true }
  )

  const toggleLocale = () => {
    localeRef.value = localeRef.value === 'zh-CN' ? 'en-US' : 'zh-CN'
  }

  return {
    locale: localeRef,
    elementPlusLocale,
    appLocale,
    toggleLocale,
  }
}
