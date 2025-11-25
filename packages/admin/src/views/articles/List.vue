<template>
  <div class="article-list">
    <el-card>
      <template #header>
        <div class="list-header">
          <span>{{ t('article.list') }}</span>
          <el-button type="primary" @click="handleCreate" size="small">
            {{ t('article.create') }}
          </el-button>
        </div>
      </template>

      <!-- 过滤栏 -->
      <div class="filter-bar">
        <el-select
          v-model="filter.status"
          clearable
          style="width: 130px; margin-right: 8px"
          @change="fetchList"
        >
          <el-option value="draft" :label="t('article.status.draft')" />
          <el-option value="published" :label="t('article.status.published')" />
        </el-select>

        <el-select
          v-model="filter.tag"
          clearable
          filterable
          allow-create
          default-first-option
          style="width: 200px; margin-right: 8px"
          :placeholder="t('article.tagFilter')"
          @change="fetchList"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag.slug"
            :label="`${tag.name} (${tag.used})`"
            :value="tag.slug"
          />
          <el-option value="_untagged" :label="t('article.untagged')" />
        </el-select>

        <el-button @click="fetchList" size="small">
          {{ t('common.refresh') }}
        </el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" :style="{ width: '100%' }">
        <el-table-column :label="t('article.cover')" width="120">
          <template #default="{ row }">
            <img v-if="row.cover_image" :src="row.cover_image" class="list-cover" />
            <span v-else class="text-gray">-</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" :label="t('article.title')" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row.id)">
              {{ row.title }}
            </el-link>
          </template>
        </el-table-column>

        <!-- 标签列 -->
        <el-table-column :label="t('article.tags')" width="180">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="tag in row.tags || []" :key="tag" size="small" type="info">
                {{ tag }}
              </el-tag>
              <span v-if="!row.tags?.length" class="text-gray">
                {{ t('article.untagged') }}
              </span>
            </el-space>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ t(`article.status.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.createdAt')" width="180">
          <template #default="{ row }">
            {{ dayjs(row.created_at).format('YYYY-MM-DD HH:mm') }}
          </template>
        </el-table-column>

        <el-table-column :label="t('common.actions')" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="handleEdit(row.id)">
              {{ t('common.edit') }}
            </el-button>
            <el-popconfirm
              :title="t('common.confirmDelete')"
              @confirm="handleDelete(row.id)"
              :confirm-button-text="t('common.yes')"
              :cancel-button-text="t('common.no')"
            >
              <template #reference>
                <el-button size="small" type="danger" link>
                  {{ t('common.delete') }}
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-if="pagination.total > 0"
        style="margin-top: 16px; text-align: right"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        @size-change="handleSizeChange"
        @current-change="fetchList"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

import { getPostsApi, deletePostApi, getAllTagsApi } from '@/apis/posts'
import type { PostItemRaw, TagItem } from '@/types/post'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const tableData = ref<PostItemRaw[]>([])
const tagOptions = ref<TagItem[]>([])

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const filter = reactive({
  status: '' as '' | 'draft' | 'published',
  tag: '' as string | '_untagged',
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getPostsApi({
      page: pagination.page,
      limit: pagination.limit,
      status: filter.status || undefined,
      tag: filter.tag || undefined,
    })
    tableData.value = res.data.posts
    pagination.total = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const fetchTags = async () => {
  const res = await getAllTagsApi()
  tagOptions.value = res.data
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchList()
}

const handleCreate = () => {
  router.push({ name: 'ArticleCreate' })
}

const handleEdit = (id: string) => {
  router.push({ name: 'ArticleEdit', params: { id } })
}

const handleDelete = async (id: string) => {
  try {
    await deletePostApi(id)
    ElMessage.success(t('article.deleted'))
    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1
    }
    await fetchList()
  } catch {
    /* 统一拦截器已提示 */
  }
}

onMounted(async () => {
  await fetchTags()
  await fetchList()
})
</script>

<style scoped lang="scss">
.article-list {
  padding: 20px;
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .filter-bar {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }
  .text-gray {
    color: var(--el-text-color-placeholder);
  }
}
.list-cover {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
