<template>
  <div class="system-monitor">
    <div v-if="!rawData || !systemInfo" class="loading-container">
      <el-skeleton :rows="12" animated />
      <!-- 增加 rows 以覆盖趋势图 -->
    </div>
    <template v-else>
      <!-- 性能指标 -->
      <div class="section performance">
        <h3 class="section-title">{{ t('systemMonitor.performance') }}</h3>
        <div class="metrics-grid">
          <!-- CPU -->
          <el-card class="metric-card cpu-card">
            <div class="usage-section">
              <div class="usage-header">
                <span>{{ t('systemMonitor.cpu') }}</span>
                <span class="value">{{ formatPercent(rawData.cpu.usagePercent) }}</span>
              </div>
              <el-progress
                :percentage="rawData.cpu.usagePercent"
                :show-text="false"
                :stroke-width="8"
                :color="getProgressColor(rawData.cpu.usagePercent)"
                class="progress-bar"
              />
            </div>
            <div class="info-list">
              <div class="info-item">
                <label>{{ t('systemMonitor.model') }}:</label>
                <span>{{ safeSystemInfo.cpu.model }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.cores') }}:</label>
                <span>{{ safeSystemInfo.cpu.cores }}</span>
              </div>
            </div>
          </el-card>

          <!-- Memory -->
          <el-card class="metric-card memory-card">
            <div class="usage-section">
              <div class="usage-header">
                <span>{{ t('systemMonitor.memory') }}</span>
                <span class="value">{{ formatPercent(rawData.memory.usagePercent) }}</span>
              </div>
              <el-progress
                :percentage="rawData.memory.usagePercent"
                :show-text="false"
                :stroke-width="8"
                :color="getProgressColor(rawData.memory.usagePercent)"
                class="progress-bar"
              />
            </div>
            <div class="info-list">
              <div class="info-item">
                <label>{{ t('systemMonitor.totalMemory') }}:</label>
                <span>{{ rawData.memory.totalMB }} MB</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.usedMemory') }}:</label>
                <span>{{ rawData.memory.usedMB }} MB</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.freeMemory') }}:</label>
                <span>{{ rawData.memory.freeMB }} MB</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 历史趋势（新增） -->
      <div class="section history-trend" v-if="historyData.length > 0">
        <h3 class="section-title">{{ t('systemMonitor.historyTrend') }}</h3>
        <el-card class="trend-card">
          <CpuMemoryTrendChart :cpu-data="formattedCpuData" :memory-data="formattedMemoryData" />
        </el-card>
      </div>

      <!-- 系统信息 -->
      <div class="section system-info">
        <h3 class="section-title">{{ t('systemMonitor.systemInfoGroup') }}</h3>

        <!-- 磁盘卡片单独占一行 -->
        <div class="disk-container">
          <el-card class="metric-card disk-card">
            <h3 class="card-title">{{ t('systemMonitor.disks') }}</h3>
            <div v-if="rawData.disks.length === 0" class="no-disks">
              {{ t('systemMonitor.noDisks') }}
            </div>
            <div v-else class="disks-grid">
              <div
                v-for="(disk, index) in rawData.disks"
                :key="disk.mount || index"
                class="disk-item"
              >
                <div class="disk-usage-header">
                  <span class="disk-mount">{{ disk.mount }}</span>
                  <span class="disk-value">{{ formatPercent(disk.usagePercent) }}</span>
                </div>
                <el-progress
                  :percentage="disk.usagePercent"
                  :show-text="false"
                  :stroke-width="6"
                  :color="getProgressColor(disk.usagePercent)"
                  class="disk-progress"
                />
                <div class="disk-info">
                  <span>{{ t('systemMonitor.used') }}: {{ disk.usedGB }} GB</span>
                  <span>{{ t('systemMonitor.total') }}: {{ disk.totalGB }} GB</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 系统状态和系统详情并排显示 -->
        <div class="status-info-container">
          <el-card class="metric-card status-card">
            <h3 class="card-title">{{ t('systemMonitor.systemStatus') }}</h3>
            <div class="info-list">
              <div class="info-item">
                <label>{{ t('systemMonitor.uptime') }}:</label>
                <span>{{ formattedUptime }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.loadAverage') }}:</label>
                <span>{{ loadAvgText }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.lastUpdate') }}:</label>
                <span>{{ lastUpdateTime }}</span>
              </div>
            </div>
          </el-card>

          <el-card class="metric-card info-card">
            <h3 class="card-title">{{ t('systemMonitor.systemDetails') }}</h3>
            <div class="info-list">
              <div class="info-item">
                <label>{{ t('systemMonitor.hostname') }}:</label>
                <span>{{ safeSystemInfo.os.hostname }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.os') }}:</label>
                <span>{{ safeSystemInfo.os.version }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.version') }}:</label>
                <span>{{ safeSystemInfo.os.release }}</span>
              </div>
              <div class="info-item">
                <label>{{ t('systemMonitor.architecture') }}:</label>
                <span>{{ safeSystemInfo.os.arch }}</span>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  getSystemMetrics,
  getSystemInfo,
  getSystemMetricsHistory,
  type SystemMetricsRaw,
  type SystemInfoRaw,
} from '@/apis/monitor'
import { ElMessage } from 'element-plus'
import CpuMemoryTrendChart from '@/components/CpuMemoryTrendChart.vue'

const { t } = useI18n()

const rawData = ref<SystemMetricsRaw | null>(null)
const systemInfo = ref<SystemInfoRaw | null>(null)
const historyData = ref<Array<{ timestamp: string; cpu: number; memory: number }>>([])
const loading = ref(false)
const lastUpdateTime = ref<string>('')

const safeSystemInfo = computed(() => ({
  cpu: {
    model: systemInfo.value?.cpu?.model || t('systemMonitor.unavailable'),
    cores: systemInfo.value?.cpu?.cores || 'N/A',
  },
  os: {
    hostname: systemInfo.value?.os?.hostname || 'N/A',
    version: systemInfo.value?.os?.version || 'N/A',
    release: systemInfo.value?.os?.release || 'N/A',
    arch: systemInfo.value?.os?.arch || 'N/A',
  },
}))

// 格式化历史数据供图表使用
const formattedCpuData = computed(() =>
  historyData.value.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: item.cpu,
  }))
)

const formattedMemoryData = computed(() =>
  historyData.value.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: item.memory,
  }))
)

const fetchData = async () => {
  loading.value = true
  try {
    const [metrics, info, historyRes] = await Promise.all([
      getSystemMetrics(),
      getSystemInfo(),
      getSystemMetricsHistory(),
    ])
    rawData.value = metrics
    systemInfo.value = info
    historyData.value = historyRes.history
    lastUpdateTime.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('加载系统监控数据失败:', error)
    ElMessage.error(t('systemMonitor.loadFailed'))
    rawData.value = null
    systemInfo.value = null
    historyData.value = []
  } finally {
    loading.value = false
  }
}

const formattedUptime = computed(() => {
  if (!rawData.value) return '—'
  const seconds = rawData.value.system.uptimeSeconds
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (days > 0) {
    return `${days} ${t('systemMonitor.days')}, ${hours}:${minutes.toString().padStart(2, '0')}`
  }
  return `${hours}:${minutes.toString().padStart(2, '0')}`
})

const loadAvgText = computed(() => {
  const avg = rawData.value?.system.loadAverage
  if (!avg || avg.length === 0 || avg[0] === null) return t('systemMonitor.unavailable')
  return avg
    .slice(0, 3)
    .map(v => v.toFixed(2))
    .join(', ')
})

const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`
}

const getProgressColor = (percent: number): string => {
  if (percent < 60) return '#67C23A'
  if (percent < 85) return '#E6A23C'
  return '#F56C6C'
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="scss">
.system-monitor {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background-color: var(--main-bg);
  color: var(--text-primary);

  .section {
    margin-bottom: 32px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 20px;
      border-bottom: 1px solid var(--el-border-color);
      padding-bottom: 8px;
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .disk-container {
    width: 100%;
    margin-bottom: 24px;

    .metric-card.disk-card {
      width: 100%;
    }
  }

  .status-info-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
  }

  .metric-card,
  .trend-card {
    background-color: var(--el-bg-color);
    border-radius: 14px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: none;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
    }

    .card-title {
      margin: 0 0 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--el-border-color);
      font-size: 18px;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .trend-card {
    padding: 20px;
  }

  .metric-card {
    .usage-section {
      margin-bottom: 20px;

      .usage-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        font-size: 15px;
        color: var(--text-secondary);

        .value {
          font-weight: bold;
          font-size: 18px;
          color: var(--text-primary);
        }
      }

      .progress-bar {
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
      }
    }

    .info-list {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;

      .info-item {
        display: flex;
        justify-content: space-between;
        font-size: 14px;

        label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        span {
          color: var(--text-primary);
          text-align: right;
        }
      }
    }

    &.disk-card {
      .disks-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 16px;
        padding-top: 12px;

        .disk-item {
          padding: 14px;
          background-color: var(--el-fill-color-light);
          border-radius: 10px;
          border: 1px solid var(--el-border-color);

          .disk-usage-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;

            .disk-mount {
              font-weight: 600;
              color: var(--text-primary);
            }

            .disk-value {
              font-weight: bold;
              color: var(--text-primary);
            }
          }

          .disk-progress {
            height: 6px;
            border-radius: 3px;
            margin: 6px 0;
          }

          .disk-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: var(--text-secondary);
          }
        }
      }
    }
  }
}
</style>
