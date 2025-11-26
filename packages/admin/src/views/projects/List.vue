<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="list-header">
          <span>{{ t('projects.list') }}</span>
          <el-button type="primary" @click="handleCreate" size="small">
            {{ t('projects.create') }}
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
          v-model="filter.sort"
          style="width: 160px; margin-right: 8px"
          @change="fetchList"
        >
          <el-option value="priority desc" :label="t('projects.priorityDesc')" />
          <el-option value="priority asc" :label="t('projects.priorityAsc')" />
          <el-option value="createdAt desc" :label="t('projects.createdAtDesc')" />
          <el-option value="createdAt asc" :label="t('projects.createdAtAsc')" />
        </el-select>

        <el-button @click="fetchList" size="small">{{ t('common.refresh') }}</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" :style="{ width: '100%' }">
        <el-table-column :label="t('projects.cover')" width="120">
          <template #default="{ row }">
            <img v-if="row.cover_image" :src="row.cover_image" class="list-cover" />
            <span v-else class="text-gray">{{ t('common.none') }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="title" :label="t('projects.title')" min-width="180">
          <template #default="{ row }">
            <el-link type="primary" @click="handleEdit(row.id)">{{ row.title }}</el-link>
          </template>
        </el-table-column>

        <el-table-column :label="t('projects.techStack')" width="200">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="t in row.tech_stack" :key="t" size="small">{{ t }}</el-tag>
            </el-space>
          </template>
        </el-table-column>

        <el-table-column :label="t('projects.demo')" width="80">
          <template #default="{ row }">
            <el-link v-if="row.demo_url" :href="row.demo_url" target="_blank" :icon="View" />
            <span v-else class="text-gray">{{ t('common.none') }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('projects.repo')" width="80">
          <template #default="{ row }">
            <el-link v-if="row.repo_url" :href="row.repo_url" target="_blank" :icon="Link" />
            <span v-else class="text-gray">{{ t('common.none') }}</span>
          </template>
        </el-table-column>

        <el-table-column :label="t('projects.priority')" width="100">
          <template #default="{ row }">{{ row.priority }}</template>
        </el-table-column>

        <el-table-column :label="t('common.status')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'published' ? 'success' : 'info'">
              {{ t(`article.status.${row.status}`) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column :label="t('common.createdAt')" width="170">
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
import { View, Link } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

import { getProjectsApi, deleteProjectApi } from '@/apis/projects'
import type { ProjectItem, ProjectListResponse } from '@/types/projects'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const tableData = ref<ProjectItem[]>([])

const pagination = reactive({ page: 1, limit: 10, total: 0 })
const filter = reactive({
  status: '' as '' | 'draft' | 'published',
  sort: 'priority desc' as 'priority desc' | 'priority asc' | 'createdAt desc' | 'createdAt asc',
})

const fetchList = async () => {
  loading.value = true
  try {
    const [sortField, order] = filter.sort.split(' ') as ['priority' | 'createdAt', 'desc' | 'asc']
    const res = await getProjectsApi({
      page: pagination.page,
      limit: pagination.limit,
      status: filter.status || undefined,
      sort: sortField,
      order,
    })
    tableData.value = res.data.rows
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

const handleCreate = () => router.push({ name: 'ProjectCreate' })
const handleEdit = (id: string) => router.push({ name: 'ProjectEdit', params: { id } })

const handleDelete = async (id: string) => {
  try {
    await deleteProjectApi(id)
    ElMessage.success(t('projects.deleted'))
    if (tableData.value.length === 1 && pagination.page > 1) pagination.page -= 1
    await fetchList()
  } catch {}
}

onMounted(fetchList)
</script>

<style scoped lang="scss">
.project-list {
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
    gap: 8px;
  }
  .list-cover {
    width: 80px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
  }
  .text-gray {
    color: var(--el-text-color-placeholder);
  }
}
</style>
