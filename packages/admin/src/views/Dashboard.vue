<!-- packages/admin/src/views/Dashboard.vue -->
<template>
  <div class="dashboard-page">
    <el-card class="welcome-card">
      <div class="welcome-header">
        <el-avatar :size="60" :src="adminInfo.displayAvatar" />
        <div class="welcome-text">
          <h2>{{ t('common.welcome') }}, {{ adminInfo.displayName }}!</h2>
          <p>{{ t('login.subtitle') }}</p>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon color="#409eff" size="24"><Document /></el-icon>
            <div>
              <div class="stat-title">{{ t('nav.articles') }}</div>
              <div class="stat-value">128</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon color="#67c23a" size="24"><User /></el-icon>
            <div>
              <div class="stat-title">{{ t('common.welcome') }}</div>
              <div class="stat-value">{{ adminInfo.displayName }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon color="#e6a23c" size="24"><Monitor /></el-icon>
            <div>
              <div class="stat-title">{{ t('nav.systemMonitor') }}</div>
              <div class="stat-value">{{ t('systemMonitor.running') }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="8" :lg="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon color="#f56c6c" size="24"><Operation /></el-icon>
            <div>
              <div class="stat-title">{{ t('nav.dashboard') }}</div>
              <div class="stat-value">v1.0.0</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Document, User, Monitor, Operation } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useAdminInfoStore } from '@/stores/adminInfo'

const { t } = useI18n()
const adminInfo = useAdminInfoStore()
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: 20px;
}

.welcome-card {
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
}

.welcome-header {
  display: flex;
  align-items: center;
  gap: 16px;

  .welcome-text h2 {
    margin: 0;
    font-size: 22px;
    color: var(--text-primary);
  }

  .welcome-text p {
    margin: 4px 0 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
}

.stat-card {
  height: 100%;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;

  .stat-title {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .stat-value {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-primary);
  }
}
</style>
