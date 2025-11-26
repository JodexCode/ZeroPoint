<template>
  <div class="project-edit">
    <el-card>
      <template #header>{{ pageTitle }}</template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item :label="t('projects.title')" prop="title">
          <el-input v-model="form.title" :placeholder="t('projects.titlePlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('projects.description')">
          <el-input
            v-model="form.description"
            type="textarea"
            maxlength="500"
            show-word-limit
            :placeholder="t('projects.descriptionPlaceholder')"
          />
        </el-form-item>

        <el-form-item :label="t('projects.techStack')">
          <el-select
            ref="tagSelect"
            v-model="form.techStack"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="t('projects.techStackPlaceholder')"
            style="width: 100%"
            @keyup.enter="onTagEnter"
            @change="onTagsChange"
          />
        </el-form-item>

        <el-form-item :label="t('projects.demoUrl')">
          <el-input v-model="form.demoUrl" :placeholder="t('projects.demoUrlPlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('projects.repoUrl')">
          <el-input v-model="form.repoUrl" :placeholder="t('projects.repoUrlPlaceholder')" />
        </el-form-item>

        <el-form-item :label="t('projects.priority')">
          <el-input-number
            v-model="form.priority"
            :min="0"
            :max="999"
            :step="1"
            controls-position="right"
            style="width: 130px"
          />
          <span class="priority-tip">{{ t('projects.priorityTip') }}</span>
        </el-form-item>

        <el-form-item :label="t('common.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="draft">{{ t('article.status.draft') }}</el-radio>
            <el-radio value="published">{{ t('article.status.published') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('projects.cover')">
          <CoverUpload v-model="form.coverImage" type="projectCover" />
        </el-form-item>
      </el-form>

      <div class="actions">
        <el-button @click="router.back()">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="handleSubmit('draft')" :loading="submitting">
          {{ t('common.save') }}
        </el-button>
        <el-button type="success" @click="handleSubmit('published')" :loading="submitting">
          {{ t('common.publish') }}
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
import type { ElSelect, FormInstance } from 'element-plus'

import { createProjectApi, updateProjectApi, getProjectByIdApi } from '@/apis/projects'
import CoverUpload from '@/components/CoverUpload.vue'
import type { ProjectCreateParams, ProjectItem } from '@/types/projects'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const submitting = ref(false)

const isEditing = computed(() => !!route.params.id)
const pageTitle = computed(() => t(isEditing.value ? 'projects.edit' : 'projects.create'))
const tagSelect = ref<InstanceType<typeof ElSelect>>()

/* 统一收口：收起下拉 + 清输入 + 光标归位 */
const closePanelAndClearInput = () => {
  nextTick(() => {
    tagSelect.value?.blur()
    nextTick(() => {
      tagSelect.value?.focus()
      const input = tagSelect.value?.$el.querySelector('input') as HTMLInputElement
      if (input) input.value = ''
    })
  })
}
const onTagEnter = () => closePanelAndClearInput()
const onTagsChange = () => closePanelAndClearInput()

const form = reactive<ProjectCreateParams>({
  title: '',
  description: '',
  techStack: [],
  demoUrl: null,
  repoUrl: null,
  coverImage: null,
  status: 'draft',
  priority: 0,
})

const rules = {
  title: [{ required: true, message: () => t('projects.titlePlaceholder') }],
  status: [{ required: true }],
}

const loadProject = async (id: string) => {
  const res: ProjectItem = (await getProjectByIdApi(id)).data
  Object.assign(form, {
    ...res,
    coverImage: res.cover_image ?? undefined,
    techStack: res.tech_stack ?? [],
  })
}

const handleSubmit = async (actionStatus: 'draft' | 'published') => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    form.status = actionStatus

    if (isEditing.value) {
      await updateProjectApi(route.params.id as string, form)
      ElMessage.success(t('projects.updated'))
    } else {
      await createProjectApi(form)
      ElMessage.success(t('projects.created'))
    }
    router.push({ name: 'Projects' })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) await loadProject(route.params.id as string)
})
</script>

<style scoped lang="scss">
.project-edit {
  padding: 20px;
  .priority-tip {
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
  .actions {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
