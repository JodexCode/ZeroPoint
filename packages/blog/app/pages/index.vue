<template>
  <div>
    <!-- ===== 英雄区 ===== -->
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-shapes">
        <div class="shape shape-1" />
        <div class="shape shape-2" />
        <div class="shape shape-3" />
        <div class="shape shape-4" />
      </div>
      <div class="hero-grid" />

      <div class="hero-container">
        <!-- 左侧头像 + 社交 -->
        <div class="hero-left">
          <div class="avatar-spin">
            <div class="spin-ring"></div>
          </div>
          <div class="avatar-static">
            <img src="https://cos.jodex.cn/admin/admin.jpg" alt="avatar" class="avatar-img" />
            <div class="status-dot" />
          </div>
          <div class="social-list">
            <a href="#" class="social-link" aria-label="github"><i>📱</i></a>
            <a href="#" class="social-link" aria-label="mail"><i>✉️</i></a>
          </div>
        </div>

        <!-- 右侧文字 -->
        <div class="hero-right">
          <div class="hello-badge">👋 欢迎来到我的数字世界</div>
          <h1 class="hero-title">
            我是 <span class="name-highlight">{{ title }}</span>
          </h1>
          <div class="typewriter-box">
            <div class="typewriter-placeholder">记录我的编程之旅</div>
          </div>
          <p class="hero-desc">{{ minTitle }}</p>
          <div class="hero-actions">
            <a href="/blog" class="btn btn-primary">阅读博客</a>
            <a href="/projects" class="btn btn-outline">查看项目</a>
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

      <div class="scroll-hint" />
    </section>

    <!-- ===== 关于我（仅保留这一节） ===== -->
    <section class="about-section">
      <div class="about-container">
        <div class="about-header">
          <span class="decos decos-top">{</span>
          <h2><span class="code-comment">//</span>关于我</h2>
          <span class="decos decos-bottom">}</span>
        </div>
        <p class="about-subtitle">
          前端开发 &nbsp;|&nbsp;技术宅&nbsp;|&nbsp;游戏狂魔&nbsp;|&nbsp;学生党
        </p>
        <div class="bio-card">
          <div class="intro-placeholder">这里后期用 v-html 渲染后端返回的富文本简介。</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const title = '每天睡25小时'
const minTitle = '这里是一段个人简介，可替换为后端返回的 minTitle。'
const statList = [
  { num: '0+', label: '项目经验' },
  { num: '0+', label: '技术文章' },
  { num: '2+', label: '学习年限' },
]
</script>

<style scoped lang="scss">
/* 0. 仅依赖已有 CSS 变量 */
$primary: var(--primary);
$text: var(--text);
$bg: var(--bg);
$switch-alpha: var(--switch-bg-alpha);
$shadow: var(--box-shadow);
$about-shadow: var(--about-card-shadow);

/* 1. 通用工具 */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  &.btn-primary {
    background: $primary;
    color: #fff;
    &:hover {
      box-shadow: 0 10px 15px -3px rgba($primary, 0.4);
    }
  }
  &.btn-outline {
    background: transparent;
    border: 2px solid $primary;
    color: $primary;
    &:hover {
      background: $primary;
      color: #fff;
    }
  }
}
.card {
  background: var(--card-bg, rgba($bg, 0.75)); /* 浅色/深色自动切换 */
  backdrop-filter: blur(16px);
  border: 1px solid var(--card-border, rgba($text, 0.08));
  border-radius: 1rem;
  box-shadow: $shadow;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-4px);
    // box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

/* 2. 英雄区 */
.hero {
  position: relative;
  min-height: calc(100vh - 56px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.hero-bg {
  z-index: -999;
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, $primary 0%, $bg 50%, #2dd4aa 100%);
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
  background: $primary;
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
    linear-gradient(rgba($primary, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba($primary, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
.hero-container {
  z-index: 100;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  @media (min-width: 1024px) {
    flex-direction: row;
  }
}
.hero-left {
  text-align: center;
  position: relative;
}

/* 旋转环 - 仅环转 */
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
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, $primary, #2dd4aa, $primary);
  mask: radial-gradient(circle at center, transparent calc(100% - 4px), black 0);
  -webkit-mask: radial-gradient(circle at center, transparent calc(100% - 4px), black 0);
}

/* 静止层 - 头像+状态点 */
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
  border: 4px solid $bg;
  animation: pulse 2s infinite;
}

.social-list {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  .social-link {
    @extend .card;
    width: 3rem;
    height: 3rem;
    display: grid;
    place-items: center;
    font-size: 1.25rem;
    color: $text;
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
  background: rgba($primary, 0.1);
  color: $primary;
  border: 1px solid rgba($primary, 0.2);
  font-size: 0.875rem;
}
.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  color: $text;
  @media (min-width: 768px) {
    font-size: 4rem;
  }
  .name-highlight {
    position: relative;
    color: $primary;
  }
}
.typewriter-placeholder {
  height: 4rem;
  font-size: 1.5rem;
  color: rgba($text, 0.7);
}
.hero-desc {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  max-width: 42rem;
  line-height: 1.6;
  color: rgba($text, 0.8);
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
      color: $primary;
    }
    .stat-label {
      font-size: 0.875rem;
      color: rgba($text, 0.7);
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
  border: 2px solid rgba($text, 0.4);
  border-radius: 9999px;
  display: flex;
  justify-content: center;
  padding-top: 0.5rem;
  &::before {
    content: '';
    width: 2px;
    height: 0.75rem;
    background: rgba($text, 0.6);
    border-radius: 2px;
    animation: scrollDown 2s ease-in-out infinite;
  }
}

/* -------------------- 3. 关于我 -------------------- */
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
  margin-bottom: 3rem;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -2rem;
    left: 50%;
    transform: translateX(-50%);
    width: 8rem;
    height: 0.3rem;
    background: linear-gradient(to right, transparent, $primary, transparent);
    opacity: 0.8;
  }
  .decos {
    position: absolute;
    font-size: 3rem;
    opacity: 0.2;
    color: $primary;
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
    font-family: 'Fira Code', monospace;
    color: $primary;
    margin-right: 0.25rem;
    font-weight: 900;
    font-size: 36px;
  }
}
.about-subtitle {
  margin-bottom: 2rem;
  color: rgba($text, 0.7);
  opacity: 0.8;
}
.bio-card {
  @extend .card;
  padding: 2.5rem;
  max-width: 56rem;
  margin: 0 auto;
  .intro-placeholder {
    color: rgba($text, 0.6);
    text-align: center;
  }
  box-shadow: $about-shadow;
}

/* -------------------- 4. 动画 -------------------- */
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

/* -------------------- 5. 响应式 -------------------- */
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
</style>
