<!-- packages/admin/src/components/MdEditorImageUpload.vue -->
<template>
  <div class="insert-image-bar">
    <el-button size="small" @click="onClick">
      <el-icon><Picture /></el-icon>
      {{ t('article.insertImage') }}
    </el-button>
    <el-progress
      v-if="percent > 0 && percent < 100"
      :percentage="percent"
      :stroke-width="6"
      style="width: 200px; margin-left: 12px"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import { uploadWithProgress } from '@/utils/upload'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const percent = ref(0)

const onClick = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('图片大小不能超过 5M')
      return
    }
    percent.value = 0
    try {
      const url = await uploadWithProgress(file, 'image', p => (percent.value = p))
      await navigator.clipboard.writeText(url)
      ElMessage.success(t('article.copySuccess'))
    } catch (e: any) {
      ElMessage.error(e.message || '上传失败')
    } finally {
      percent.value = 0
    }
  }
  input.click()
}
</script>

<style scoped>
.insert-image-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
</style>
