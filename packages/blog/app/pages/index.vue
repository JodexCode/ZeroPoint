<template>
  <div class="home">
    <!-- 1. 加载中 -->
    <div v-if="pending" class="loading-box">
      <svg class="spin" width="40" height="40" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="var(--primary)"
          stroke-width="5"
        ></circle>
      </svg>
      <span>加载中...</span>
    </div>

    <!-- 2. 加载失败 -->
    <div v-else-if="error" class="error-box">
      <p>⚠️ 加载失败：{{ error }}</p>
      <button class="btn btn-primary" @click="() => refresh()">重新加载</button>
    </div>

    <!-- 3. 正常内容 -->
    <template v-else>
      <!-- ===== 英雄区 ===== -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
        <div class="hero-grid"></div>

        <div class="hero-container">
          <!-- 左侧头像 + 社交 -->
          <div class="hero-left slide-in-left no-select">
            <div class="avatar-spin">
              <div class="spin-ring"></div>
            </div>
            <div class="avatar-static">
              <img :src="avatar" alt="avatar" class="avatar-img" />
              <div class="status-dot"></div>
            </div>
            <div class="social-list">
              <a
                v-for="(s, i) in socials"
                :key="s.id"
                :href="s.url"
                target="_blank"
                rel="noopener"
                class="social-link"
                :aria-label="s.name"
                :style="{ '--i': i }"
              >
                <img
                  :src="s.icon"
                  @error="e => ((e.currentTarget as HTMLImageElement).textContent = '🔗')"
                />
              </a>
            </div>
          </div>

          <!-- 右侧文字 -->
          <div class="hero-right slide-in-right">
            <div class="hello-badge">👋 欢迎来到我的数字世界</div>
            <h1 class="hero-title">
              我是 <span class="name-highlight">{{ site?.meta.author_name }}</span>
            </h1>
            <div class="typewriter-box">
              <div class="typewriter-placeholder">{{ site?.meta.bio }}</div>
            </div>
            <div class="hero-actions no-select">
              <NuxtLink to="/blog" class="btn btn-primary">阅读博客</NuxtLink>
              <NuxtLink to="/projects" class="btn btn-outline">查看项目</NuxtLink>
            </div>
            <div class="stats">
              <div
                v-for="(s, i) in statList"
                :key="i"
                class="stat-item"
                :style="{ animationDelay: i * 0.2 + 's' }"
              >
                <div class="stat-num">{{ s.num }}</div>
                <div class="stat-label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="scroll-hint"></div>
      </section>

      <!-- ===== 关于我 ===== -->
      <section class="about-section" v-fade-in>
        <div class="about-container">
          <div class="about-header">
            <span class="decos decos-top">{</span>
            <h2><span class="code-comment">//</span>关于我</h2>
            <span class="decos decos-bottom">}</span>
          </div>
          <p class="about-subtitle">
            <span v-for="t in tags" :key="t.id" class="tag-chip">{{ t.text }}</span>
          </p>
          <div class="bio-card">
            <div class="intro-markdown markdown" v-html="aboutHtml"></div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { renderMarkdown } from '@/utils/md'

/* 拉取全站配置（无组件库） */
const {
  data: site,
  pending,
  error,
  refresh,
} = await useAsyncData('site-config', () =>
  $fetch<{ meta: Record<string, string>; socials: any[]; tags: any[] }>('/api/site/config')
)

const [{ data: projectCount }, { data: articleCount }] = await Promise.all([
  useFetch('/api/projects/count'),
  useFetch('/api/blog/count'),
])

/* 计算属性 */
const avatar = computed(() => site.value?.meta?.avatar || '/head.jpg')
const socials = computed(() => site.value?.socials || [])
const tags = computed(() => site.value?.tags || [])

/* 统计列表 */
const statList = computed(() => [
  { num: String(site.value?.socials?.length ?? 0), label: '社交账号' },
  { num: `${projectCount.value ?? 0}+`, label: '项目经验' },
  { num: `${articleCount.value ?? 0}+`, label: '技术文章' },
])
const aboutHtml = computed(() => renderMarkdown(site.value?.meta?.about_me || ''))

const route = useRoute()
// 读取你在 .env 配置的线上域名
const {
  public: { siteUrl },
} = useRuntimeConfig()
const canonical = `${siteUrl}${route.fullPath}`

useHead({
  title: `ZeroPoint - ${site?.value?.meta.author_name}的个人博客`,
  link: [{ rel: 'canonical', href: canonical }],
})

useSeoMeta({
  description: '记录代码、生活与思考，让数字世界多一点温度。',
})
</script>

<style scoped lang="scss">
@use '../assets/styles/markdown.scss' as *;

/* 1. 加载 & 错误 */
.loading-box,
.error-box {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 1.1rem;
  color: var(--text-secondary);
}
.spin {
  animation: rotate 1s linear infinite;
  circle {
    stroke-dasharray: 80;
    stroke-dashoffset: 60;
  }
}
.error-box {
  color: var(--color-danger, #f56c6c);
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 200px;
  height: 64px;
  border-radius: 32px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  &.btn-primary {
    background: var(--primary);
    color: #fff;
    &:hover {
      box-shadow: 0 10px 15px -3px rgba(var(--primary), 0.4);
    }
  }
  &.btn-outline {
    background: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);
    &:hover {
      background: var(--primary);
      color: #fff;
    }
  }
}

.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg {
  z-index: -999;
  position: absolute;
  inset: 0;
  /* 1. 柔和径向光晕 */
  background:
    radial-gradient(120% 120% at 50% 0, var(--primary) 0%, transparent 60%),
    radial-gradient(80% 80% at 80% 20%, #2dd4aa 0%, transparent 50%), var(--bg); /* 兜底背景色 */
  opacity: 0.22; /* 整体压暗，避免刺眼 */
  transition: opacity 0.35s; /* 随主题切换淡入淡出 */
}

/* 深色模式再压暗一点 */
html[data-theme='dark'] .hero-bg {
  opacity: 0.15;
}

.hero-shapes .shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.18;
  animation: float 6s ease-in-out infinite;
}
.shape-1 {
  top: 10%;
  left: 10%;
  width: 16rem;
  height: 16rem;
  background: var(--primary);
}
.shape-2 {
  top: 60%;
  right: 10%;
  width: 24rem;
  height: 24rem;
  background: #2dd4aa;
  animation-delay: 2s;
}
.shape-3 {
  bottom: 20%;
  left: 20%;
  width: 12rem;
  height: 12rem;
  background: #22d3ee;
  animation-delay: 4s;
}
.hero-grid {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image:
    linear-gradient(rgba(var(--primary), 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(var(--primary), 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
.hero-container {
  z-index: 100;
  max-width: 1500px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4vh;
  @media (min-width: 1024px) {
    flex-direction: row;
    gap: 20rem;
  }
}
.hero-left {
  text-align: center;
  position: relative;
}
.avatar-spin {
  position: absolute;
  inset: 0;
  width: 16rem;
  height: 16rem;
  margin: 0 auto;
  animation: spin 20s linear infinite;
  pointer-events: none;
}
.spin-ring {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  border: 3px solid var(--primary);
  filter: blur(1px);
}
.avatar-static {
  position: relative;
  width: 16rem;
  height: 16rem;
  margin: 0 auto 2rem;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.7s;
  box-shadow: 0 1px 5px rgba(#000, 0.5);
  animation: avatarRotate 20s linear infinite;
  .avatar-static:hover & {
    transform: scale(1.1);
  }
}
.status-dot {
  position: absolute;
  bottom: -0.5rem;
  right: -0.5rem;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #22c55e;
  border: 4px solid var(--bg);
  animation: pulse 2s infinite;
}
.social-list {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  .social-link {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    background: rgba(var(--bg), 0.75);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(var(--text), 0.08);
    border-radius: 50%;
    font-size: 1.25rem;
    color: var(--text);
    box-shadow: var(--box-shadow);
    transition: all 0.5s ease;
    animation: popIn 1s ease-out forwards;
    animation-delay: calc(var(--i) * 200ms);
    animation-fill-mode: both;

    @keyframes popIn {
      0% {
        transform: scale(0.7) translateY(40px);
      }
      50% {
        transform: scale(1.08) translateY(-3px);
      }
      100% {
        transform: scale(1) translateY(0);
      }
    }
    &:hover {
      translate: 0 -5px;
    }
    img {
      width: 20px;
      height: 20px;
      object-fit: contain;
      transition: filter 0.3s;
      /* 深色模式反白 */
      html[data-theme='dark'] & {
        filter: invert(1) brightness(1.8);
      }
    }
    html[data-theme='dark'] & {
      background: rgba(255, 255, 255, 0.12); // 比原来亮 4×
      border-color: rgba(255, 255, 255, 0.25);
      box-shadow:
        0 0 0 1px rgba(255, 255, 255, 0.15),
        0 6px 16px rgba(0, 0, 0, 0.35);
    }
  }
}
.hero-right {
  flex: 1;
  text-align: center;
  @media (min-width: 1024px) {
    text-align: left;
  }
}
.hello-badge {
  display: inline-block;
  margin-bottom: 1.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--primary) 20%, transparent);
  color: var(--primary);
  border: 1px solid color-mix(in srgb, var(--primary) 80%, transparent);
  font-size: 0.875rem;
}
.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  color: var(--text);
  @media (min-width: 768px) {
    font-size: 4rem;
  }
  .name-highlight {
    position: relative;
    color: var(--primary);
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -4px; // 与文字间距
      height: 3px; // 线粗
      width: 100%;
      background: currentColor; // 跟随主色
      transform: scaleX(0); // 初始隐藏
      transform-origin: center;
      animation: underlineSweep 1.8s ease-in-out infinite;
    }
    @keyframes underlineSweep {
      0% {
        transform: scaleX(0);
      }
      50% {
        transform: scaleX(1);
      }
      100% {
        transform: scaleX(0);
      }
    }
  }
}
.typewriter-placeholder {
  height: 4rem;
  font-size: 1.5rem;
  color: rgba(var(--text), 0.7);
}
.hero-desc {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  max-width: 42rem;
  line-height: 1.6;
  color: rgba(var(--text), 0.8);
}
.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  @media (min-width: 640px) {
    flex-direction: row;
  }
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
  .stat-item {
    text-align: center;
    .stat-num {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
    }
    .stat-label {
      font-size: 0.875rem;
      color: rgba(var(--text), 0.7);
    }
  }
}
.scroll-hint {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 2.5rem;
  border: 2px solid rgba(var(--text), 0.4);
  border-radius: 9999px;
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
  &::before {
    content: '';
    width: 2px;
    height: 0.75rem;
    background: rgba(var(--text), 0.6);
    border-radius: 2px;
    animation: scrollDown 2s ease-in-out infinite;
  }
}

/* 关于我 */
.about-section {
  padding: 6rem 0;
}
.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}
.about-header {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -2rem;
    left: 50%;
    transform: translateX(-50%);
    width: 8rem;
    height: 0.3rem;
    background: linear-gradient(to right, transparent, var(--primary), transparent);
    opacity: 0.8;
  }
  .decos {
    position: absolute;
    font-size: 3rem;
    opacity: 0.2;
    color: var(--primary);
  }
  .decos-top {
    top: -3rem;
    left: -3rem;
  }
  .decos-bottom {
    bottom: -3rem;
    right: -3rem;
  }
  h2 {
    font-size: 2rem;
    font-weight: 700;
  }
  .code-comment {
    color: var(--primary);
    margin-right: 0.25rem;
    font-weight: 900;
    font-size: 36px;
  }
}
.about-subtitle {
  margin-bottom: 2rem;
  color: rgba(var(--text), 0.7);
  opacity: 0.8;
}
.tag-chip {
  display: inline-block;
  margin: 0 0.25rem 0.5rem;
  padding: 0.25rem 0.75rem;
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
  border-radius: 9999px;
  font-size: 0.875rem;
}
.bio-card {
  padding: 2.5rem;
  max-width: 56rem;
  margin: 0 auto;
  background: rgba(var(--bg), 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(var(--text), 0.08);
  border-radius: 1rem;
  box-shadow: var(--about-card-shadow, 0 8px 32px rgba(#000, 0.1));
}
.beian {
  margin-top: 2rem;
  font-size: 0.75rem;
  color: rgba(var(--text), 0.5);
  text-align: center;
}

/* 动画 */
@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(5deg);
  }
  66% {
    transform: translateY(10px) rotate(-5deg);
  }
}
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes scrollDown {
  0%,
  100% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(12px);
    opacity: 0;
  }
}
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  .typewriter-placeholder {
    font-size: 1.125rem;
  }
  .hero-shapes .shape {
    display: none;
  }
  .stats {
    gap: 1rem;
  }
}
@media (max-width: 640px) {
  .btn {
    width: 100%;
  }
}

/* 进入前状态 */
// .slide-in-left {
//   opacity: 0;
//   transform: translate(-100px, 100px); /* 从左侧屏幕外进来 */
// }
// .slide-in-right {
//   opacity: 0;
//   transform: translate(100px, 100px); /* 从右侧屏幕外进来 */
// }

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translate(-100px, 50px);
  }
  60% {
    opacity: 1;
    transform: translate(-50px, 0);
  } /* ① 先升到目标Y */
  100% {
    opacity: 1;
    transform: translate(0, 0);
  } /* ② 再水平归位 */
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translate(100px, 50px);
  }
  60% {
    opacity: 1;
    transform: translate(50px, 0);
  } /* ① 先升到目标Y */
  100% {
    opacity: 1;
    transform: translate(0, 0);
  } /* ② 再水平归位 */
}

/* 立即执行 */
@media (prefers-reduced-motion: no-preference) {
  .slide-in-left {
    animation: slideInLeft 1s ease-out forwards;
  }
  .slide-in-right {
    animation: slideInRight 1s ease-out forwards;
  }
}

@keyframes avatarRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.no-select {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
