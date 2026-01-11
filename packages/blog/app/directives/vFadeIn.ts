// directives/vFadeIn.ts
import type { App, Directive } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const fadeInDirective: Directive = {
  mounted(el) {
    el.classList.add('fade-from')
    const { stop } = useIntersectionObserver(
      el,
      ([entry]) => {
        if (entry?.isIntersecting) {
          requestAnimationFrame(() => {
            //  等一帧再加终点
            el.classList.replace('fade-from', 'fade-to')
            stop()
          })
        }
      },
      { threshold: 0.1, root: null }
    )
  },
}

export default {
  install(app: App) {
    app.directive('fade-in', fadeInDirective)
  },
}
