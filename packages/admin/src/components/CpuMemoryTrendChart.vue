<!-- packages/admin/src/components/CpuMemoryTrendChart.vue -->
<template>
  <div class="chart-container">
    <VChart :option="chartOption" autoresize class="echart" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, GridComponent, LegendComponent])

const props = defineProps<{
  cpuData: { time: string; value: number }[]
  memoryData: { time: string; value: number }[]
}>()

const chartOption = computed(() => {
  const times = props.cpuData.map(item => item.time)
  const cpuValues = props.cpuData.map(item => item.value)
  const memoryValues = props.memoryData.map(item => item.value)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['CPU (%)', 'Memory (%)'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value} %' },
    },
    series: [
      {
        name: 'CPU (%)',
        type: 'line',
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        data: cpuValues,
        color: '#409EFF',
      },
      {
        name: 'Memory (%)',
        type: 'line',
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        data: memoryValues,
        color: '#67C23A',
      },
    ],
  }
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 320px;
}
.echart {
  width: 100%;
  height: 100%;
}
</style>
