// packages/admin/src/main.ts
import './assets/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import i18n, { setupI18n } from '@/locales/index'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// 必须先 use(pinia)，才能在 setupI18n 中 useLocaleStore()
await setupI18n()

app.use(i18n)
app.use(router)

app.mount('#app')
