// plugins/directives.ts
import vFadeIn from '@/directives/vFadeIn'

export default defineNuxtPlugin(nuxtApp => {
  console.log('[plugin] 注册全局指令 vFadeIn')
  nuxtApp.vueApp.use(vFadeIn)
})
