<template>
  <div class="blog-detail">
    <button class="back-button" @click="goBack">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
      <span>返回博客</span>
    </button>
    <!-- 顶部图片区域 -->
    <div class="cover-image">
      <img :src="post.cover_image" :alt="post.title" />
    </div>

    <!-- 内容容器 -->
    <div class="content-container">
      <!-- 文章头部信息 -->
      <div class="post-header">
        <h1 class="title">{{ post.title }}</h1>

        <div class="post-meta">
          <!-- 左侧：发布时间 -->
          <div class="meta-left">
            <time class="publish-date">
              <svg
                class="icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {{ formatDate(post.created_at) }}
            </time>

            <!-- 阅读量 -->
            <span class="views" v-if="post.views">
              <svg
                class="icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {{ post.views }}
            </span>
          </div>

          <!-- 右侧：标签 -->
          <div class="tags" v-if="post.tags && post.tags.length">
            <span v-for="t in post.tags" :key="t" class="tag">
              {{ t }}
            </span>
          </div>
        </div>

        <!-- 摘要 -->
        <p v-if="post.excerpt" class="excerpt">{{ post.excerpt }}</p>
      </div>

      <!-- 正文内容 -->
      <article class="post-content markdown-body" v-html="html"></article>

      <!-- 文章底部信息 -->
      <div class="post-footer">
        <div class="footer-meta">
          <time class="update-date" v-if="post.updated_at">
            最后更新: {{ formatDate(post.updated_at) }}
          </time>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { renderMarkdown } from '@/utils/md'

const { data: res } = await useAsyncData<{ success: boolean; data: Record<string, any> }>(
  `blog-${useRoute().params.slug}`,
  () => $fetch(`/api/blog/${useRoute().params.slug}`)
)
const post = computed(() => {
  console.log(res.value?.data)

  return res.value?.data ?? {}
})
const html = computed(() => renderMarkdown(post.value.content || ''))

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY年MM月DD日')
}

const goBack = () => {
  navigateTo('/blog')
}

/* ===== SEO ===== */
const route = useRoute()
const {
  public: { siteUrl },
} = useRuntimeConfig()
const seoTitle = computed(() => `${post.value.title} - ZeroPoint`)
const seoDesc = computed(() => post.value.excerpt || post.value.title)

useHead({
  title: seoTitle,
  link: [{ rel: 'canonical', href: `${siteUrl}/blog/${route.params.slug}` }],
})
useSeoMeta({
  description: seoDesc,
  ogTitle: seoTitle,
  ogDescription: seoDesc,
  ogUrl: `${siteUrl}/blog/${route.params.slug}`,
})
</script>

<style scoped lang="scss">
.blog-detail {
  min-height: 100vh;
  background: var(--bg);
}

/* 封面图片 */
.cover-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
  }

  &:hover img {
    transform: scale(1.02);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100px;
    background: linear-gradient(to bottom, transparent, var(--bg));
  }
}

/* 内容容器 */
.content-container {
  max-width: 800px;
  margin: -60px auto 0;
  padding: 0 1.5rem 4rem;
  position: relative;
  z-index: 1;
}

/* 文章头部 */
.post-header {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 2.5rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  .title {
    margin: 0 0 1.5rem;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text);
    text-align: center;
  }
}

/* 元信息布局 */
.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--card-border);
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

/* 左侧元信息 */
.meta-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: rgba(var(--text), 0.8);
  font-size: 0.95rem;

  .publish-date,
  .views {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon {
    flex-shrink: 0;
    opacity: 0.8;
  }
}

/* 标签样式 */
.tags {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  .tag {
    padding: 0.4rem 1rem;
    background: var(--primary);
    color: white;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(42, 157, 143, 0.3);
    }
  }
}

/* 摘要 */
.excerpt {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(var(--text), 0.8);
  text-align: center;
  padding: 1rem 0 0;
  border-top: 1px solid var(--card-border);
  margin: 1.5rem 0 0;
}

/* 正文内容 */
.post-content {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 3rem;
  line-height: 1.8;
  color: var(--text);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

  /* Markdown 内容样式 */
  :deep {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 2rem;
      margin-bottom: 1rem;
      color: var(--text);
      font-weight: 600;
      position: relative;
      padding-bottom: 0.5rem;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 60px;
        height: 3px;
        background: var(--primary);
        border-radius: 2px;
      }
    }

    h1 {
      font-size: 2rem;
    }
    h2 {
      font-size: 1.75rem;
    }
    h3 {
      font-size: 1.5rem;
    }
    h4 {
      font-size: 1.25rem;
    }

    p {
      margin-bottom: 1.5rem;
      font-size: 1.05rem;
    }

    ul,
    ol {
      padding-left: 1.5rem;
      margin-bottom: 1.5rem;

      li {
        margin-bottom: 0.5rem;

        &::marker {
          color: var(--primary);
        }
      }
    }

    a {
      color: var(--primary);
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        border-bottom-color: var(--primary);
      }
    }

    img {
      max-width: 100%;
      border-radius: 12px;
      margin: 2rem 0;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    pre {
      background: rgba(var(--text), 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.5rem 0;
      overflow-x: auto;
      border: 1px solid var(--card-border);

      code {
        background: transparent;
        padding: 0;
        border-radius: 0;
      }
    }

    code:not(pre code) {
      background: rgba(var(--primary), 0.1);
      color: var(--primary);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 0.9em;
    }

    blockquote {
      border-left: 4px solid var(--primary);
      margin: 1.5rem 0;
      padding: 0.5rem 0 0.5rem 1.5rem;
      background: rgba(var(--primary), 0.05);
      border-radius: 0 8px 8px 0;
      font-style: italic;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;

      th,
      td {
        padding: 0.75rem;
        border: 1px solid var(--card-border);
      }

      th {
        background: rgba(var(--primary), 0.1);
        font-weight: 600;
      }
    }
  }
}

/* 文章底部 */
.post-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--card-border);
  color: rgba(var(--text), 0.6);
  font-size: 0.9rem;

  .footer-meta {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .update-date {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &::before {
      content: '📝';
      font-size: 0.8em;
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .cover-image {
    height: 300px;
  }

  .content-container {
    padding: 0 1rem 3rem;
    margin-top: -40px;
  }

  .post-header {
    padding: 1.5rem;

    .title {
      font-size: 2rem;
    }
  }

  .post-content {
    padding: 1.5rem;

    :deep {
      h1 {
        font-size: 1.75rem;
      }
      h2 {
        font-size: 1.5rem;
      }
      h3 {
        font-size: 1.25rem;
      }
    }
  }
}

@media (max-width: 480px) {
  .cover-image {
    height: 250px;
  }

  .post-header .title {
    font-size: 1.75rem;
  }

  .meta-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
.back-button {
  position: fixed;
  top: 100px;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateX(-4px);
    border-color: var(--primary);
    box-shadow: 0 6px 16px rgba(42, 157, 143, 0.2);

    svg {
      transform: translateX(-2px);
    }
  }

  svg {
    transition: transform 0.3s ease;
  }
}

/* 响应式调整 - 新增 */
@media (max-width: 768px) {
  .back-button {
    top: 80px;
    left: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .back-button {
    top: 70px;
    left: 0.5rem;
    padding: 0.5rem;

    span {
      display: none; /* 小屏幕只显示图标 */
    }

    svg {
      margin-right: 0;
    }
  }
}
</style>
