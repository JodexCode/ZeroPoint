<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- 左侧版权 -->
      <div class="footer-left">
        <div class="logo">{{ AppName.name1 }} {{ AppName.name2 }}</div>
        <p class="copyright">© {{ currentYear }} 开发者成长日志 | 技术分析博客</p>
      </div>

      <!-- 中间导航（桌面） -->
      <nav class="footer-nav desktop-only">
        <router-link v-for="item in footerLinks" :key="item.path" :to="item.path" class="nav-link">
          {{ item.name }}
        </router-link>
      </nav>

      <!-- 右侧社交 -->
      <div v-if="socials.length" class="social">
        <a
          v-for="social in socials"
          :key="social.id"
          :href="social.url"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
          :aria-label="social.name"
        >
          <img :src="social.icon" @error="handleImgError" />
        </a>
      </div>
    </div>

    <!-- 移动端导航 -->
    <nav class="footer-nav mobile-only">
      <router-link v-for="item in footerLinks" :key="item.path" :to="item.path" class="nav-link">
        {{ item.name }}
      </router-link>
    </nav>

    <!-- 备案信息（有数据才渲染） -->
    <div v-if="icp || police" class="record">
      <a v-if="icp" :href="`https://beian.miit.gov.cn/`" target="_blank" title="网站ICP备案">
        {{ icp }}
      </a>
      <a
        v-if="police"
        class="gongan"
        href="http://www.beian.gov.cn/portal/registerSystemInfo"
        target="_blank"
        rel="noopener noreferrer"
        title="网站公安备案"
      >
        <img
          src="https://img.alicdn.com/tfs/TB1..50QpXXXXX7XpXXXXXXXXXX-40-40.png"
          alt="anbei"
          style="width: 16px; height: 16px"
        />
        {{ police }}
      </a>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { AppName } from '@/config'
const currentYear = new Date().getFullYear()

/* 1. 拉取后台数据 */
const { data: config } = await useAsyncData('site-config-footer', () =>
  $fetch<{ meta: Record<string, string>; socials: any[] }>('/api/site/config')
)

/* 2. 取备案号（可能为空） */
const icp = computed(() => config.value?.meta?.icp || '')
const police = computed(() => config.value?.meta?.police || '')

/* 3. 社交列表（可能为空） */
const socials = computed(() => config.value?.socials || [])

/* 4. 导航（固定） */
const footerLinks = [
  { name: '首页', path: '/' },
  { name: '博客', path: '/blog' },
  { name: '项目集', path: '/projects' },
]

function handleImgError(e: Event) {
  const target = e.target as HTMLImageElement | null
  if (target) {
    target.textContent = '🔗'
  }
}
</script>

<style scoped lang="scss">
$primary: var(--primary);
$text: var(--text);
$bg: var(--bg);
$card-bg: var(--card-bg, rgba($bg, 0.75));
$card-border: var(--card-border, rgba($text, 0.08));

.footer {
  margin-top: 3rem;
  padding: 2rem 0;
  background: $card-bg;
  border-top: 1px solid $card-border;
}

.footer-inner {
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.footer-left {
  text-align: center;
  @media (min-width: 768px) {
    text-align: left;
  }
  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: $primary;
    margin-bottom: 0.25rem;
  }
  .copyright {
    font-size: 0.875rem;
    color: rgba($text, 0.7);
  }
}

.footer-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  &.desktop-only {
    display: none;
    @media (min-width: 768px) {
      display: flex;
    }
  }
  &.mobile-only {
    display: flex;
    @media (min-width: 768px) {
      display: none;
    }
  }
  .nav-link {
    font-size: 0.875rem;
    color: rgba($text, 0.7);
    text-decoration: none;
    transition: color 0.3s;
    &:hover {
      color: $primary;
    }
  }
}

.social {
  display: flex;
  gap: 1rem;
  .social-link {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: rgba($text, 0.1);
    color: $text;
    transition:
      background 0.3s,
      color 0.3s;
    &:hover {
      background: $primary;
      color: #fff;
    }
    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }
  }
}

.record {
  margin-top: 1.5rem;
  font-size: 0.75rem;
  text-align: center;
  color: rgba($text, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      color: $primary;
    }
  }
  .gongan {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
