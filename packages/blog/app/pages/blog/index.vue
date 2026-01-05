<template>
  <div class="blog-index">
    <!-- 头部 -->
    <header class="list-header">
      <h1 class="title">words & notes</h1>
      <p class="subtitle">偶尔写下的文字，记录踩坑、折腾与思考，愿也能为你的片刻带来一点启发。</p>

      <!-- 通用搜索 -->
      <AppSearchBox
        v-model="searchKw"
        placeholder="搜索标题 / 摘要 / 拼音"
        @search="onSearch"
        style="margin-top: 20px"
      />
    </header>

    <!-- 加载中 -->
    <div v-if="pending" class="loading-box">
      <svg class="spin" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r="20" fill="none" stroke="var(--primary)" />
      </svg>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="error-box">
      <p>⚠️ 加载失败</p>
      <button class="btn" @click.prevent="refresh()">重新加载</button>
    </div>

    <!-- 空结果 -->
    <div v-else-if="!list.length" class="empty-box">
      <template v-if="searchKw">
        未找到与<strong>“{{ searchKw }}”</strong>相关的文章<br />
        <button class="btn-text" @click.prevent="clearSearch">显示全部</button>
      </template>
      <template v-else>暂无文章</template>
    </div>

    <!-- 文章卡片 -->
    <div v-else class="cards">
      <article v-for="p in list" :key="p.id" class="card">
        <NuxtLink :to="`/blog/${p.slug}`" class="cover-box">
          <img :src="p.cover_image || '/placeholder.jpg'" :alt="p.title" />
        </NuxtLink>
        <div class="meta">
          <time>{{ dayjs(p.created_at).format('YYYY-MM-DD') }}</time>
          <span>👀 {{ p.views }}</span>
        </div>
        <h2 class="title">
          <NuxtLink :to="`/blog/${p.slug}`">{{ p.title }}</NuxtLink>
        </h2>
        <p class="excerpt">{{ p.excerpt }}</p>
      </article>
    </div>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page === 1" @click.prevent="go(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click.prevent="go(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'

const route = useRoute()

/* 搜索关键词 */
const searchKw = ref<string>('')

/* 分页参数 */
const page = ref<number>(1)
const limit = 12

/* 统一取数（空值自动加载第一页） */
const {
  data: res,
  pending,
  error,
  refresh,
} = await useAsyncData(
  `blog-list-${page.value}-${searchKw.value}`,
  () =>
    $fetch('/api/blog/list', {
      params: {
        page: page.value,
        limit,
        search: searchKw.value.trim() || undefined,
      },
    }),
  { watch: [page, searchKw] }
)

const list = computed(() => (res.value as any)?.data?.list ?? [])
const totalPages = computed(() => (res.value as any)?.data?.pagination?.totalPages ?? 1)

/* 搜索回调（空值也触发，回到第一页） */
function onSearch(kw: string) {
  searchKw.value = kw.trim()
  navigateTo({ query: { page: 1, ...(searchKw.value && { search: searchKw.value }) } })
}

/* 清空搜索 */
function clearSearch() {
  searchKw.value = ''
  navigateTo({ query: {} })
}

/* 翻页（保留当前关键词） */
function go(newPage: number) {
  page.value = newPage
}
</script>

<style scoped lang="scss">
/* 1. 布局 */
.blog-index {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 2. 加载/错误/空态 */
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

/* 3. 卡片网格 */
.cards {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

/* 4. 单张卡片 */
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

/* 5. 封面图 */
.cover-box {
  display: block;
  aspect-ratio: 16/9;
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

/* 6. 内容区 */
.meta {
  display: flex;
  justify-content: space-between;
  padding: 1rem 1rem 0;
  font-size: 0.875rem;
  color: rgba(var(--text), 0.7);
}
.title {
  margin: 0.5rem 1rem;
  font-size: 1.25rem;
  a {
    color: var(--text);
    text-decoration: none;
    transition: color 0.2s;
    &:hover {
      color: var(--primary);
    }
  }
}
.excerpt {
  margin: 0.5rem 1rem 1rem;
  color: color-mix(in srgb, var(--text) 80%, transparent);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  /* autoprefixer: ignore next */
  line-clamp: 3;
}

/* 7. 分页 */
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

/* ===== 头部引导 ===== */
.list-header {
  text-align: center;
  margin: 0 auto 3rem;
  max-width: 700px;
  .title {
    font-size: 2rem;
    color: var(--primary);
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .subtitle {
    margin-top: 0.5rem;
    color: rgba(var(--text), 0.8);
    line-height: 1.6;
  }
}
.btn-text {
  margin-top: 0.5rem;
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.9rem;
  &:hover {
    text-decoration: underline;
  }
}
.spin {
  animation: rotate 1s linear infinite;
  width: 40px;
  height: 40px;
}
</style>
