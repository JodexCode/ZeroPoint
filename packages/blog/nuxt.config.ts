// nuxt.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  css: ['@/assets/styles/main.scss'],

  vite: {
    plugins: [
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: 'types/auto-imports.d.ts',
      }),
      Components({
        dts: 'types/components.d.ts',
      }),
    ],
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.PUBLIC_SITE_URL || 'https://jodex.cn',
    },
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
  },
  nitro: {
    moduleSideEffects: ['cos-nodejs-sdk-v5'],
  },
})
