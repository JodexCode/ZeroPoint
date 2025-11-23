<!-- packages/admin/src/components/NetworkTrendChart.vue -->
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
import { TooltipComponent, GridComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, TooltipComponent, GridComponent, LegendComponent])

const props = defineProps<{
  rxData: { time: string; value: number }[]
  txData: { time: string; value: number }[]
}>()

const chartOption = computed(() => {
  const times = props.rxData.map(item => item.time)
  const rxValues = props.rxData.map(item => item.value)
  const txValues = props.txData.map(item => item.value)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any[]) => {
        let result = `${params[0].name}<br/>`
        params.forEach(param => {
          result += `${param.marker} ${param.seriesName}: ${param.value.toFixed(1)} KB/s<br/>`
        })
        return result
      },
    },
    legend: {
      data: ['Receive (KB/s)', 'Transmit (KB/s)'],
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '25%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLabel: {
        overflow: 'break',
        width: 80,
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLabel: { formatter: '{value} KB/s' },
    },
    series: [
      {
        name: 'Receive (KB/s)',
        type: 'line',
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        data: rxValues,
        color: '#909399', // 灰色系，区别于 CPU/内存
      },
      {
        name: 'Transmit (KB/s)',
        type: 'line',
        smooth: true,
        lineStyle: { width: 2 },
        symbol: 'circle',
        symbolSize: 6,
        data: txValues,
        color: '#E6A23C', // 橙色，代表“发送”
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
