<template>
  <div class="project-index">
    <!-- 头部引导 -->
    <header class="list-header">
      <h1 class="title">side projects</h1>
      <p class="subtitle">业余折腾的小玩意，拿来练手、方便生活，也顺便让这个世界更有趣一点。</p>
    </header>

    <!-- 骨架/错误/空态 -->
    <div v-if="pending" class="loading-box">
      <svg class="spin" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary)" />
      </svg>
    </div>
    <div v-else-if="error" class="error-box">
      <p>⚠️ 加载失败</p>
      <button class="btn" @click="() => refresh()">重新加载</button>
    </div>
    <div v-else-if="!list.length" class="empty-box">还没有项目</div>

    <!-- 项目卡片 -->
    <div v-else class="cards">
      <article v-for="p in list" :key="p.id" class="card">
        <a :href="p.homepage || p.repo_url" target="_blank" class="cover-box">
          <img :src="p.cover_image || '/placeholder.jpg'" :alt="p.name" />
        </a>
        <div class="meta">
          <time>{{ dayjs(p.created_at).format('YYYY-MM-DD') }}</time>
        </div>
        <h2 class="name">
          <a :href="p.homepage || p.repo_url" target="_blank">
            {{ p.name }}
          </a>
        </h2>
        <p class="desc">{{ p.description }}</p>
        <div class="links">
          <a v-if="p.homepage" :href="p.homepage" target="_blank">🔗 预览</a>
          <a v-if="p.repo_url" :href="p.repo_url" target="_blank">⭐ 源码</a>
        </div>
      </article>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page === 1" @click="go(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="go(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()
const page = ref(Number(route.query.page) || 1)
const limit = 12

const {
  data: res,
  pending,
  error,
  refresh,
} = await useAsyncData(
  `project-list-${page.value}`,
  () => $fetch('/api/projects/list', { params: { page: page.value, limit } }),
  { watch: [page] }
)

const list = computed(() => (res.value as any)?.data?.list ?? [])
const totalPages = computed(() => (res.value as any)?.data?.pagination?.totalPages ?? 1)

function go(newPage: number) {
  return navigateTo({ query: { page: newPage } })
}
</script>

<style scoped lang="scss">
/* 头部 */
.list-header {
  text-align: center;
  margin-bottom: 2.5rem;
  .title {
    font-size: 2rem;
    color: var(--primary);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .subtitle {
    margin: 0.5rem auto 0;
    max-width: 60ch;
    color: rgba(var(--text), 0.8);
  }
}

/* 与博客列表保持一致的基础样式 */
.project-index {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.loading-box,
.error-box,
.empty-box {
  min-height: 50vh;
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
}
.btn {
  padding: 0.5rem 1.2rem;
  border-radius: 2rem;
  background: var(--primary);
  color: #fff;
  border: none;
  cursor: pointer;
  transition: box-shadow 0.3s;
  &:hover {
    box-shadow: 0 4px 12px rgba(var(--primary), 0.4);
  }
}

/* 卡片网格：比博客多一列 */
.cards {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;
}

@media (min-width: 900px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card {
  background: rgba(var(--card-bg), 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(#000, 0.1);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  &:hover {
    transform: translateY(-4px);
  }
}

.cover-box {
  display: block;
  aspect-ratio: 16/10;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  &:hover img {
    transform: scale(1.05);
  }
}

.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1rem 0;
  font-size: 0.875rem;
  color: rgba(var(--text), 0.7);
  .status {
    font-size: 0.75rem;
    background: rgba(var(--primary), 0.12);
    color: var(--primary);
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }
}

.name {
  margin: 0.5rem 1rem;
  font-size: 1.125rem;
  a {
    color: var(--text);
    text-decoration: none;
    &:hover {
      color: var(--primary);
    }
  }
}

.desc {
  margin: 0.5rem 1rem 1rem;
  color: rgba(var(--text), 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.links {
  display: flex;
  gap: 0.75rem;
  padding: 0 1rem 1.25rem;
  font-size: 0.875rem;
  a {
    color: var(--primary);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  button {
    padding: 0.5rem 1.2rem;
    border-radius: 2rem;
    background: rgba(var(--text), 0.1);
    color: var(--text);
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    &:hover:not(:disabled) {
      background: var(--primary);
      color: #fff;
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}
</style>
