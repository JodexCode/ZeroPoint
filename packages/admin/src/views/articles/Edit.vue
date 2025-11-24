<!-- packages/admin/src/views/articles/Edit.vue -->
<template>
  <div class="article-edit">
    <el-card>
      <template #header>
        <span>{{ pageTitle }}</span>
      </template>

      <el-form
        :model="form"
        :rules="rules"
        ref="formRef"
        label-width="80px"
        style="margin-bottom: 20px"
      >
        <el-form-item :label="t('article.title')" prop="title">
          <el-input v-model="form.title" :placeholder="t('article.titlePlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('common.status')" prop="status">
          <el-select v-model="form.status" style="width: 120px">
            <el-option value="draft" :label="t('article.status.draft')" />
            <el-option value="published" :label="t('article.status.published')" />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 使用 md-editor-v3 的双栏模式（默认即为左右预览） -->
      <MdEditor
        v-model="form.content"
        language="zh-CN"
        :noPrettier="true"
        :toolbars="toolbars"
        editor-id="article-editor"
        :placeholder="t('article.contentPlaceholder')"
        :onHighlight="handleHighlight"
        style="height: 600px"
      />

      <div class="actions" style="margin-top: 16px; text-align: right">
        <el-button @click="router.back()">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEditing ? t('common.save') : t('common.publish') }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import type { ToolbarNames } from 'md-editor-v3'
import { getPostByIdApi, createPostApi, updatePostApi } from '@/apis/posts'

// 🔥 引入 md-editor-v3（Vue 3 + v6.2.0）
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

// 🔧 高亮支持
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// ✅ 工具栏配置（v6.2.0 合法名称）
const toolbars: ToolbarNames[] = [
  'bold',
  'italic',
  'strikeThrough',
  'title',
  'unorderedList',
  'orderedList',
  'link',
  'image',
  'codeRow',
  'code',
  'revoke',
  'next',
] as const

// ✅ 高亮处理函数
const handleHighlight = (code: string, lang: string) => {
  if (!lang) {
    return hljs.highlightAuto(code).value
  }
  try {
    return hljs.highlight(code, { language: lang }).value
  } catch {
    return hljs.highlightAuto(code).value
  }
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEditing = computed(() => !!route.params.id)
const pageTitle = computed(() => t(isEditing.value ? 'article.edit' : 'article.create'))

interface ArticleForm {
  title: string
  content: string
  status: 'draft' | 'published'
}

const form = reactive<ArticleForm>({
  title: '',
  content: '',
  status: 'draft',
})

const rules = {
  title: [
    { required: true, message: t('article.titleRequired'), trigger: 'blur' },
    { min: 2, message: t('article.titleMinLength'), trigger: 'blur' },
  ],
  content: [{ required: true, message: t('article.contentRequired'), trigger: 'blur' }],
}

// 模拟加载文章数据
const loadArticle = async (id: string) => {
  try {
    const res = await getPostByIdApi(id)
    Object.assign(form, {
      title: res.data.title,
      content: res.data.content,
      status: res.data.status,
    })
  } catch (error) {
    ElMessage.error(t('common.loadFailed'))
    router.push({ name: 'ArticleList' })
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (isEditing.value) {
      // 更新文章
      const id = route.params.id as string
      await updatePostApi(id, {
        title: form.title,
        content: form.content,
        status: form.status,
      })
      ElMessage.success(t('article.updated'))
    } else {
      // 创建文章
      await createPostApi({
        title: form.title,
        content: form.content,
        status: form.status,
      })
      ElMessage.success(t('article.created'))
    }

    router.push({ name: 'ArticleList' })
  } catch (error) {
    // 错误已在 axios 拦截器中统一处理，此处无需重复提示
    console.error('Submit failed:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) {
    await loadArticle(route.params.id as string)
  }
  document.title = `${pageTitle.value} - ${import.meta.env.VITE_APP_NAME || 'Admin'}`
})
</script>

<style scoped lang="scss">
.article-edit {
  padding: 20px;

  :deep(.md-editor) {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
  }

  .actions {
    margin-top: 20px;
  }
}
</style>
