// packages/admin/src/composables/useTheme.ts
import { ref, computed, watch } from 'vue'

const savedTheme = localStorage.getItem('ADMIN_THEME') || 'light'

export const useTheme = () => {
  const themeRef = ref<'light' | 'dark'>(savedTheme as any)

  // Element Plus 不需要返回 theme 对象，只需控制 html.dark
  const isDark = computed(() => themeRef.value === 'dark')

  watch(
    themeRef,
    theme => {
      localStorage.setItem('ADMIN_THEME', theme)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    { immediate: true }
  )

  const toggleTheme = () => {
    themeRef.value = themeRef.value === 'light' ? 'dark' : 'light'
  }

  return {
    theme: themeRef,
    isDark,
    toggleTheme,
  }
}
