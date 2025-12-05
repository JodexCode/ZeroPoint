<template>
  <div class="site-settings">
    <el-card v-loading="loading">
      <template #header>
        <div class="card-header">
          <span>{{ t('nav.siteSettings') }}</span>
          <el-button type="primary" size="small" @click="handleSave">
            {{ t('siteSettings.save') }}
          </el-button>
        </div>
      </template>

      <!-- 基本信息 -->
      <el-form :model="form" label-width="120px" class="basic-form">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12">
            <el-form-item
              :label="t('siteSettings.authorName')"
              prop="author_name"
              :rules="[{ required: true, message: t('siteSettings.authorNamePlaceholder') }]"
            >
              <el-input
                v-model="form.author_name"
                :placeholder="t('siteSettings.authorNamePlaceholder')"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item
              :label="t('siteSettings.bio')"
              prop="bio"
              :rules="[{ required: true, message: t('siteSettings.bioPlaceholder') }]"
            >
              <el-input
                v-model="form.bio"
                :placeholder="t('siteSettings.bioPlaceholder')"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item :label="t('siteSettings.icp')">
          <el-input v-model="form.icp" :placeholder="t('siteSettings.icpPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('siteSettings.police')">
          <el-input v-model="form.police" :placeholder="t('siteSettings.policePlaceholder')" />
        </el-form-item>
        <el-form-item
          :label="t('siteSettings.aboutMe')"
          prop="about_me"
          :rules="[{ required: true, message: t('siteSettings.aboutMePlaceholder') }]"
        >
          <el-input
            v-model="form.about_me"
            type="textarea"
            :rows="6"
            :placeholder="t('siteSettings.aboutMePlaceholder')"
          />
        </el-form-item>
      </el-form>

      <!-- 社交媒体 -->
      <el-divider />
      <h4 class="section-title">{{ t('siteSettings.socials') }}</h4>
      <el-space direction="vertical" class="w-full" size="small">
        <el-card v-for="(s, idx) in socials" :key="s.id" shadow="never" class="social-card">
          <el-row :gutter="12" align="middle">
            <el-col :span="6">
              <el-input v-model="s.name" :placeholder="t('siteSettings.icon')" />
            </el-col>
            <el-col :span="6">
              <el-input v-model="s.icon" :placeholder="t('siteSettings.iconPlaceholder')" />
            </el-col>
            <el-col :span="8">
              <el-input v-model="s.url" :placeholder="t('siteSettings.linkPlaceholder')" />
            </el-col>
            <el-col :span="4">
              <el-button size="small" @click="updateSocial(s)">
                {{ t('common.save') }}
              </el-button>
              <el-popconfirm
                :title="t('siteSettings.confirmDelete')"
                @confirm="deleteSocial(s.id!)"
              >
                <template #reference>
                  <el-button size="small" type="danger" link>
                    {{ t('common.delete') }}
                  </el-button>
                </template>
              </el-popconfirm>
            </el-col>
          </el-row>
        </el-card>
        <el-button class="w-full" @click="openSocialDlg">
          {{ t('siteSettings.addSocial') }}
        </el-button>
      </el-space>

      <!-- 个人标签 -->
      <el-divider />
      <h4 class="section-title">{{ t('siteSettings.tags') }}</h4>
      <el-space wrap>
        <el-tag
          v-for="t in tags"
          :key="t.id"
          closable
          @close="deleteTag(t.id!)"
          @click="openTagEdit(t)"
        >
          {{ t.text }}
        </el-tag>
        <el-button size="small" @click="handleAddTag">
          {{ t('siteSettings.addTag') }}
        </el-button>
      </el-space>
    </el-card>

    <!-- 新增社交媒体弹窗 -->
    <el-dialog v-model="socialDlg" :title="t('siteSettings.addSocial')" width="480">
      <el-form :model="socialForm" label-width="80px">
        <el-form-item :label="t('siteSettings.icon')" prop="name">
          <el-input v-model="socialForm.name" :placeholder="t('siteSettings.icon')" />
        </el-form-item>
        <el-form-item :label="t('siteSettings.iconLink')" prop="icon">
          <el-input v-model="socialForm.icon" :placeholder="t('siteSettings.iconPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('siteSettings.link')" prop="url">
          <el-input v-model="socialForm.url" :placeholder="t('siteSettings.linkPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="socialDlg = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmSocial">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑标签弹窗 -->
    <el-dialog v-model="tagDlg" :title="t('siteSettings.addTag')" width="400">
      <el-form :model="tagForm" label-width="80px">
        <el-form-item :label="t('siteSettings.tagText')" prop="text">
          <el-input
            v-model="tagForm.text"
            :placeholder="t('siteSettings.tagTextPlaceholder')"
            maxlength="4"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tagDlg = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmTag">
          {{ t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  getProfileApi,
  updateProfileApi,
  getSocialsApi,
  createSocialApi,
  updateSocialApi,
  deleteSocialApi,
  getProfileTagsApi,
  createProfileTagApi,
  updateProfileTagApi,
  deleteProfileTagApi,
} from '@/apis/profile'
import type { ProfileDto, SocialItem, ProfileTagItem } from '@/types/profile'

const { t } = useI18n()

/* 状态 */
const loading = ref(false)
const form = reactive<ProfileDto>({
  author_name: '',
  bio: '',
  about_me: '',
  icp: '',
  police: '',
})
const socials = ref<SocialItem[]>([])
const tags = ref<ProfileTagItem[]>([])

/* 弹窗状态 */
const socialDlg = ref(false)
const socialForm = reactive({
  name: '',
  icon: '',
  url: '',
  sort_order: 0,
})

const tagDlg = ref(false)
const tagForm = reactive<{ id?: number; text: string }>({ text: '' })

/* 初始加载 */
onMounted(async () => {
  loading.value = true
  try {
    const [p, s, t] = await Promise.all([getProfileApi(), getSocialsApi(), getProfileTagsApi()])
    Object.assign(form, p.data)
    socials.value = s.data
    tags.value = t.data
  } finally {
    loading.value = false
  }
})

/* 基本信息保存 */
const handleSave = async () => {
  try {
    await updateProfileApi(form)
    ElMessage.success(t('siteSettings.saved'))
  } catch {
    ElMessage.error(t('siteSettings.saveFailed'))
  }
}

/* 社交媒体 - 弹窗新增 */
const openSocialDlg = () => {
  socialForm.name = ''
  socialForm.icon = ''
  socialForm.url = ''
  socialDlg.value = true
}

const confirmSocial = async () => {
  if (!socialForm.name.trim()) {
    ElMessage.warning(t('siteSettings.icon'))
    return
  }
  const { data } = await createSocialApi(socialForm)
  socials.value.push({ ...socialForm, id: data.id })
  socialDlg.value = false
  ElMessage.success(t('common.saved'))
}

const updateSocial = async (s: SocialItem) => {
  await updateSocialApi(s.id!, s)
  ElMessage.success(t('common.saved'))
}

const deleteSocial = async (id: number) => {
  await deleteSocialApi(id)
  socials.value = socials.value.filter(v => v.id !== id)
}

/* 个人标签 */
const handleAddTag = () => {
  tagForm.id = undefined
  tagForm.text = ''
  tagDlg.value = true
}

const openTagEdit = (t: ProfileTagItem) => {
  tagForm.id = t.id
  tagForm.text = t.text
  tagDlg.value = true
}

const confirmTag = async () => {
  if (!tagForm.text.trim()) return
  if (tagForm.id) {
    await updateProfileTagApi(tagForm.id, { text: tagForm.text })
    const t = tags.value.find(v => v.id === tagForm.id)!
    t.text = tagForm.text
  } else {
    const { data } = await createProfileTagApi({ text: tagForm.text, sort_order: 0 })
    tags.value.push({ id: data.id, text: tagForm.text, sort_order: 0 })
  }
  tagDlg.value = false
}

const deleteTag = async (id: number) => {
  await deleteProfileTagApi(id)
  tags.value = tags.value.filter(v => v.id !== id)
}
</script>

<style scoped lang="scss">
.site-settings {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
}
.basic-form {
  max-width: 800px;
}
.social-card {
  margin-bottom: 8px;
}
.w-full {
  width: 100%;
}
</style>
