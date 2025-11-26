<template>
  <div class="cover-uploader">
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      style="display: none"
      @change="onFileChange"
    />
    <div class="preview-box" @click="openFileDialog">
      <img v-if="modelValue" :src="modelValue" class="cover" />
      <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
    </div>
    <div v-if="modelValue" class="actions">
      <el-button type="danger" size="small" link @click="removeCover">
        <el-icon><Delete /></el-icon>
        {{ t('common.delete') }}
      </el-button>
    </div>

    <!-- 进度条 -->
    <el-progress
      v-if="percent > 0 && percent < 100"
      :percentage="percent"
      :stroke-width="6"
      style="width: 120px; margin-top: 8px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { deleteAssetsApi } from '@/apis/posts'
import { uploadWithProgress } from '@/utils/upload'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const fileInput = ref<HTMLInputElement>()

const props = defineProps<{ modelValue?: string | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', v?: string | null): void }>()

const percent = ref(0)

const openFileDialog = () => fileInput.value?.click()

const onFileChange = async () => {
  const file = fileInput.value?.files?.[0]
  if (!file || !beforeUpload(file)) return

  percent.value = 0
  try {
    const url = await uploadWithProgress(file, 'cover', p => (percent.value = p))
    emit('update:modelValue', url)
    ElMessage.success(t('article.coverUploadSuccess'))
  } catch (e: any) {
    ElMessage.error(e.message || t('common.uploadFailed'))
  } finally {
    percent.value = 0
  }
}

const beforeUpload = (file: File) => {
  const allow = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allow.includes(file.type)) {
    ElMessage.error('仅支持 jpg/png/webp')
    return false
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5M')
    return false
  }
  return true
}

const removeCover = async () => {
  if (!props.modelValue) return
  const key = props.modelValue.split('/').pop()!
  await deleteAssetsApi({ keys: [`article/cover/${key}`] })
  emit('update:modelValue', null)
  ElMessage.success(t('article.coverDeleted'))
}
</script>

<style scoped lang="scss">
.cover-uploader {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}
.preview-box {
  width: 120px;
  height: 80px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    border-color: var(--el-color-primary);
  }
}
.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}
.actions {
  margin-left: 8px;
}
</style>
