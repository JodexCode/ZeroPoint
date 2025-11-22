// src/stores/locale.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'
import zhCNApp from '@/locales/zh-CN.json'
import enUSApp from '@/locales/en-US.json'

export type Language = 'zh-CN' | 'en-US'

export const useLocaleStore = defineStore('locale', () => {
  const current = ref<Language>((localStorage.getItem('ADMIN_LOCALE') as Language) || 'zh-CN')

  // 同步到 localStorage 和 html lang
  function setLocale(lang: Language) {
    current.value = lang
    localStorage.setItem('ADMIN_LOCALE', lang)
    document.documentElement.setAttribute('lang', lang.replace('-', '_'))
  }

  const elementPlusLocale = computed(() => (current.value === 'zh-CN' ? zhCn : en))

  const appLocale = computed(() => (current.value === 'zh-CN' ? zhCNApp : enUSApp))

  function toggleLocale() {
    setLocale(current.value === 'zh-CN' ? 'en-US' : 'zh-CN')
  }

  return {
    current,
    elementPlusLocale,
    appLocale,
    setLocale,
    toggleLocale,
  }
})
