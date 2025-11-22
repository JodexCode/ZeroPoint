// nuxt.config.ts
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/i18n'],
  css: ['@/assets/styles/main.scss'],
  i18n: {
    vueI18n: './i18n.config.ts',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文' },
    ],
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
  },
  vite: {
    plugins: [
      AutoImport({
        imports: ['vue', 'vue-router'],
        dts: 'auto-imports.d.ts',
      }),
      Components({
        dts: 'components.d.ts',
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/theme.scss" as *;',
        },
      },
    },
  },
});
