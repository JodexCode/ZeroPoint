<template>
  <div class="profile-container">
    <el-row :gutter="24" justify="center">
      <!-- 左侧：头像 + 操作 -->
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <div class="avatar-card">
          <div class="avatar-wrapper">
            <el-avatar :size="avatarSize" :src="adminStore.displayAvatar" class="user-avatar" />
            <!-- 悬浮遮罩 -->
            <div class="avatar-overlay" @click="openUpload">
              <el-icon :size="28" color="#fff"><Camera /></el-icon>
              <span class="overlay-text">更换头像</span>
            </div>
          </div>

          <!-- 隐藏的原生上传 -->
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />

          <el-progress
            v-if="uploadPercent > 0"
            :percentage="uploadPercent"
            :stroke-width="6"
            :show-text="false"
            class="upload-progress"
          />
        </div>
      </el-col>

      <!-- 右侧：用户名 + 昵称 + 保存 -->
      <el-col :xs="24" :sm="12" :md="16" :lg="18">
        <el-card shadow="never" class="info-card">
          <template #header>
            <div class="card-title">个人资料</div>
          </template>

          <el-form label-position="top" @submit.prevent>
            <el-form-item label="用户名">
              <div>{{ adminStore.username }}</div>
            </el-form-item>

            <el-form-item label="昵称">
              <el-input
                v-model="nickname"
                maxlength="20"
                show-word-limit
                placeholder="请输入昵称"
              />
            </el-form-item>
          </el-form>

          <div class="actions">
            <el-button type="primary" @click="saveNickname" :loading="nickSaving">
              保存昵称
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 裁剪弹窗 -->
    <ImageCropper v-model="showCropper" :image-src="tempImageSrc" @crop="handleCroppedImage" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { getAvatarUploadSign, updateAdminAvatar } from '@/apis/avatar'
import { useAdminInfoStore } from '@/stores/adminInfo'

const adminStore = useAdminInfoStore()

/* 头像上传 */
const fileInput = ref<HTMLInputElement>()
const tempImageSrc = ref('')
const showCropper = ref(false)
const uploadPercent = ref(0)

const avatarSize = computed(() => (window.innerWidth < 768 ? 80 : 120))

function openUpload() {
  fileInput.value?.click()
}

async function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    ElMessage.warning('请选择图片文件')
    return
  }
  const reader = new FileReader()
  reader.onload = ev => {
    tempImageSrc.value = ev.target?.result as string
    showCropper.value = true
  }
  reader.readAsDataURL(file)
  // 清空 input，允许重复选同一张图
  nextTick(() => {
    target.value = ''
  })
}

async function handleCroppedImage(blob: Blob) {
  try {
    uploadPercent.value = 0
    const res = await getAvatarUploadSign({ mimeType: blob.type || 'image/png' })
    const signData = res.data

    // 模拟进度
    uploadPercent.value = 30
    const uploadRes = await fetch(signData.uploadUrl, { method: 'PUT', body: blob })
    if (!uploadRes.ok) throw new Error(`COS 上传失败: ${uploadRes.status}`)

    uploadPercent.value = 100
    await updateAdminAvatar({ avatarUrl: signData.fileUrl })
    await adminStore.loadAdminInfo() // 刷新仓库
    ElMessage.success('头像更新成功！')
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    showCropper.value = false
    uploadPercent.value = 0
  }
}

/* 昵称修改 */
const nickname = ref(adminStore.nickname)
const nickSaving = ref(false)

async function saveNickname() {
  if (!nickname.value.trim()) return
  nickSaving.value = true
  try {
    await adminStore.updateNickname(nickname.value.trim())
    await adminStore.loadAdminInfo()
    // ElMessage.success('昵称已更新') // 不需要提示，因为http函数内已封装
  } catch {
    ElMessage.error('保存失败')
  } finally {
    nickSaving.value = false
  }
}
</script>

<style scoped lang="scss">
.profile-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  transition: transform 0.3s;

  &:hover .avatar-overlay {
    opacity: 1;
  }
}

.user-avatar {
  display: block;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;

  .overlay-text {
    margin-top: 4px;
    font-size: 14px;
  }
}

.upload-progress {
  width: 100%;
  margin-top: 8px;
}

.info-card {
  height: 100%;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
}

.actions {
  margin-top: 24px;
  text-align: right;
}

/* 响应式：移动端小于 767px 自动变单列并缩小按钮/文字 */
@media (max-width: 767px) {
  .profile-container {
    padding: 16px;
  }
  .card-title {
    font-size: 16px;
  }
  .actions {
    text-align: center;
  }
}
</style>
