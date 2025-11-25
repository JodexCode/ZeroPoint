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

        <!-- 标签多选：回车/失去焦点后清空内部输入框 -->
        <el-form-item :label="t('article.tags')">
          <el-select
            ref="tagSelect"
            v-model="form.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="t('article.tagPlaceholder')"
            style="width: 100%"
            @keyup.enter="onTagEnter"
            @change="onTagsChange"
          >
            <el-option
              v-for="tag in tagOptions"
              :key="tag.slug"
              :label="`${tag.name} (${tag.used})`"
              :value="tag.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="t('article.cover')" prop="coverImage">
          <CoverUpload v-model="form.coverImage" />
        </el-form-item>

        <el-form-item :label="t('article.insertImage')" class="no-label">
          <MdEditorImageUpload />
        </el-form-item>
      </el-form>

      <!-- 编辑器：自定义工具栏按钮 + 快捷键 -->
      <MdEditor
        v-model="form.content"
        language="zh-CN"
        :noPrettier="true"
        :toolbars="toolbars"
        :toolbars-exclude="['prettier']"
        editor-id="article-editor"
        :placeholder="t('article.contentPlaceholder')"
        :onHighlight="handleHighlight"
        style="height: 600px"
      />

      <div class="actions" style="margin-top: 16px; text-align: right">
        <el-button @click="router.back()">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit('draft')" :loading="submitting">
          {{ t('common.save') }}
        </el-button>
        <el-button type="success" @click="handleSubmit('published')" :loading="submitting">
          {{ t('common.publish') }}
        </el-button>
      </div>
    </el-card>
    <div class="tips">快捷键：Ctrl+Shift+F 自动格式化 Markdown</div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed, h, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { ElSelect, FormInstance } from 'element-plus'
import type { ToolbarNames } from 'md-editor-v3'

import { getPostByIdApi, createPostApi, updatePostApi, getAllTagsApi } from '@/apis/posts'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import type { TagItem } from '@/types/post'

import CoverUpload from '@/components/CoverUpload.vue'
import MdEditorImageUpload from '@/components/MdEditorImageUpload.vue'

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
]

/* ====== 格式化函数 ====== */
const handleFormat = () => {
  let txt = form.content
  // 1. 段落之间强制空一行（双 \n）
  txt = txt.replace(/([。！？.!?])\n/g, '$1\n\n')
  // 2. 多空行归一
  txt = txt.replace(/(\n)\n{2,}/g, '$1\n\n')
  // 3. 列表前后空行
  txt = txt.replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, '\n$&\n')
  // 4. 代码块前后空行
  txt = txt.replace(/(```[\s\S]*?```)/g, '\n\n$1\n\n')
  form.content = txt.trim()
}

/* ====== 快捷键：Ctrl+Shift+F ====== */
const handleKeyDown = async (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault()
    await handleFormat()
  }
}

/* ====== 高亮：同步函数 ====== */
const handleHighlight = (code: string, lang: string) => {
  if (!lang) return hljs.highlightAuto(code).value
  try {
    return hljs.highlight(code, { language: lang }).value
  } catch {
    return hljs.highlightAuto(code).value
  }
}

/* ====== 标签残留修复 ====== */
const tagSelect = ref<InstanceType<typeof ElSelect>>()

/* 统一收口：收下拉 + 清输入 + 保持光标 */
const closePanelAndClearInput = () => {
  nextTick(() => {
    tagSelect.value?.blur() // 1. 收起下拉
    nextTick(() => {
      tagSelect.value?.focus() // 2. 光标回来
      // 3. 清掉“正在敲的那串字”
      const input = tagSelect.value?.$el.querySelector('input') as HTMLInputElement
      if (input) input.value = ''
    })
  })
}

/* 回车 */
const onTagEnter = () => closePanelAndClearInput()

/* 点击下拉选项 */
const onTagsChange = () => closePanelAndClearInput()

/* ====== 其余业务逻辑（不变） ====== */
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)
const tagOptions = ref<TagItem[]>([])

const isEditing = computed(() => !!route.params.id)
const pageTitle = computed(() => t(isEditing.value ? 'article.edit' : 'article.create'))

interface ArticleForm {
  title: string
  content: string
  status: 'draft' | 'published'
  tags: string[]
  coverImage?: string
}

const form = reactive<ArticleForm>({
  title: '',
  content: '',
  status: 'draft',
  tags: [],
})

const rules = {
  title: [
    { required: true, message: t('article.titleRequired'), trigger: 'blur' },
    { min: 2, message: t('article.titleMinLength'), trigger: 'blur' },
  ],
  content: [{ required: true, message: t('article.contentRequired'), trigger: 'blur' }],
}

const loadTags = async () => {
  const res = await getAllTagsApi()
  tagOptions.value = res.data
}

const loadArticle = async (id: string) => {
  try {
    const res = await getPostByIdApi(id)
    Object.assign(form, {
      title: res.data.title,
      content: res.data.content,
      status: res.data.status,
      tags: res.data.tags || [],
      coverImage: res.data.cover_image || '',
    })
  } catch {
    ElMessage.error(t('common.loadFailed'))
    router.push({ name: 'ArticleList' })
  }
}

const handleSubmit = async (actionStatus: 'draft' | 'published') => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    form.status = actionStatus

    if (isEditing.value) {
      await updatePostApi(route.params.id as string, form)
      ElMessage.success(t('article.updated'))
    } else {
      await createPostApi(form)
      ElMessage.success(t('article.created'))
    }
    router.push({ name: 'ArticleList' })
  } catch {
    /* 统一拦截器已提示 */
  } finally {
    submitting.value = false
  }
}

onActivated(async () => {
  await loadTags()
  if (isEditing.value) await loadArticle(route.params.id as string)
  document.title = `${pageTitle.value} - ${import.meta.env.VITE_APP_NAME || 'Admin'}`
})

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))

onDeactivated(() => {
  Object.assign(form, {
    title: '',
    content: '',
    status: 'draft',
    tags: [],
  })
})

// onMounted(async () => {
//   await loadTags()
//   if (isEditing.value) await loadArticle(route.params.id as string)
//   document.title = `${pageTitle.value} - ${import.meta.env.VITE_APP_NAME || 'Admin'}`
// })
</script>

<style scoped lang="scss">
.article-edit {
  padding: 20px;
  :deep(.md-editor) {
    border: 1px solid var(--el-border-color);
    border-radius: var(--el-border-radius-base);
  }
  .actions {
    position: sticky;
    bottom: 0;
    background: var(--el-bg-color);
    padding: 12px 0;
    z-index: 10;
  }
}
.tips {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  text-align: right;
}
/* 自定义按钮样式（可选） */
:deep(.md-editor-icon) {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: var(--el-text-color-primary);
  &:hover {
    background: var(--el-fill-color-light);
  }
}

.no-label .el-form-item__label {
  display: none;
}
</style>
