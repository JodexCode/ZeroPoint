// plugins/directives.ts
import vFadeIn from '@/directives/vFadeIn'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(vFadeIn)
})
