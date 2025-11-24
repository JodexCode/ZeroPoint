<!-- packages/admin/src/views/articles/List.vue -->
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

      <el-table :data="tableData" v-loading="loading" :style="{ width: '100%' }">
        <el-table-column prop="title" :label="t('article.title')" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row.id)">
              {{ row.title }}
            </el-link>
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

import { getPostsApi, deletePostApi } from '@/apis/posts'
import type { PostItemRaw } from '@/types/post'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const tableData = ref<PostItemRaw[]>([])

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getPostsApi({
      page: pagination.page,
      limit: pagination.limit,
    })
    tableData.value = res.data.posts
    pagination.total = res.data.pagination.total
  } finally {
    loading.value = false
  }
}

const handleSizeChange = (size: number) => {
  pagination.limit = size
  pagination.page = 1
  fetchList()
}

const handleCreate = () => {
  router.push({ name: 'ArticleCreate' })
}

const handleEdit = (id: number | string) => {
  router.push({ name: 'ArticleEdit', params: { id } })
}

const handleDelete = async (id: number | string) => {
  try {
    await deletePostApi(id)
    ElMessage.success(t('article.deleted')) // ✅ 添加成功提示
    // 删除成功后刷新列表
    if (tableData.value.length === 1 && pagination.page > 1) {
      pagination.page -= 1
    }
    await fetchList()
  } catch (error) {
    // 错误已在 axios 拦截器中处理，此处可不重复处理
    console.error('Delete failed:', error)
  }
}

onMounted(() => {
  fetchList()
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
}
</style>
