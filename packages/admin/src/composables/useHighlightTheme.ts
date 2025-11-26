import { watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export const useHighlightTheme = (theme: Ref<'light' | 'dark'>) => {
  let link: HTMLLinkElement | null = null

  const apply = (isDark: boolean) => {
    // 1. 先卸旧样式
    if (link) {
      link.remove()
      link = null
    }
    // 2. 再装新样式
    link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = isDark
      ? 'https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github-dark.css'
      : 'https://cdn.jsdelivr.net/npm/highlight.js@11/styles/github.css'
    document.head.appendChild(link)
  }

  // 3. 首次 + 后续切换都走 apply
  watch(theme, val => apply(val === 'dark'), { immediate: true })

  // 4. 清理
  onUnmounted(() => link && link.remove())
}
