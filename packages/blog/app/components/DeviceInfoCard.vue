<template>
  <Teleport to="body">
    <Transition name="dic-fade">
      <div v-if="model" class="device-info-card" :style="cardStyle" @click.stop>
        <header class="dic-header">
          <div class="dic-title">
            <IconDevice name="phone" class="dic-title-icon" />
            <span>设备信息</span>
          </div>
          <button class="dic-close" @click="model = false">
            <IconDevice name="close" />
          </button>
        </header>

        <div class="dic-body">
          <div v-for="{ icon, label, value } in list" :key="label" class="dic-row">
            <IconDevice :name="icon" class="dic-row-icon" />
            <span class="dic-row-label">{{ label }}:</span>
            <span class="dic-row-value">{{ value }}</span>
          </div>
        </div>

        <div class="dic-footer">
          <div class="dic-bar" :style="{ width: bar + '%' }"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { DeviceInfo } from '~/utils/deviceInfo'
import { useVModel } from '@vueuse/core'
import type { CSSProperties, StyleValue } from 'vue'

/* ---------- 1. 生命周期放 setup 根 ---------- */
let timer: number | null = null
onMounted(() => {
  const onClickOutside = (e: Event) => {
    if ((e.target as HTMLElement).closest('.device-info-card') === null) model.value = false
  }
  document.addEventListener('click', onClickOutside, true)
  onUnmounted(() => {
    document.removeEventListener('click', onClickOutside, true)
    if (timer) clearInterval(timer)
  })
})

/* ---------- 2.  props / model  ---------- */
const props = withDefaults(
  defineProps<{ modelValue: boolean; info: DeviceInfo; x?: number; y?: number }>(),
  { x: 0, y: 0 }
)
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>()
const model = useVModel(props, 'modelValue')

/* ---------- 智能位置（边缘保护版） ---------- */
const cardStyle = computed<StyleValue>(() => {
  if (props.x === 0 && props.y === 0) return {} // 默认右下角

  const gap = 8
  const cardW = 280
  const cardH = 220
  const vw = window.innerWidth
  const vh = window.innerHeight

  let left = props.x + gap
  let top = props.y + gap

  // 1. 水平溢出处理
  if (left + cardW > vw) left = props.x - cardW - gap // 左侧
  if (left < 0) left = gap // 仍超出左边缘 → 贴左留缝
  if (left + cardW > vw) left = vw - cardW - gap // 仍超出右边缘 → 贴右留缝

  // 2. 垂直溢出处理
  if (top + cardH > vh) top = props.y - cardH - gap // 上方
  if (top < 0) top = gap // 仍超出上边缘 → 贴上留缝
  if (top + cardH > vh) top = vh - cardH - gap // 仍超出下边缘 → 贴下留缝

  return {
    position: 'fixed',
    left: `${left}px`,
    top: `${top}px`,
    transform: 'none',
  } as CSSProperties
})

/* ---------- 4. 自动关闭进度条 ---------- */
const bar = ref(100)
watch(model, v => {
  if (!v) return
  bar.value = 100
  if (timer) clearInterval(timer)
  timer = window.setInterval(() => {
    bar.value -= 2
    if (bar.value <= 0) model.value = false
  }, 100)
})

/* ---------- 5. 数据 ---------- */
const list = computed(() => [
  { icon: 'phone', label: '设备型号', value: props.info.deviceModel },
  { icon: 'cog', label: '系统版本', value: props.info.systemVersion },
  { icon: 'wifi', label: '网络类型', value: props.info.networkType },
  { icon: 'gauge', label: '网速', value: props.info.networkSpeed },
])
</script>

<style scoped>
.device-info-card {
  position: fixed;
  z-index: 9999;
  width: 280px;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow: var(--about-card-shadow);
  padding: 1rem;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  max-height: 80vh; /* 防止超长 */
  overflow: hidden;
}
.dic-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}
.dic-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}
.dic-title-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: var(--primary);
}
.dic-close {
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background 0.2s;
}
.dic-close:hover {
  background: rgba(127, 127, 127, 0.15);
}
.dic-body {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  overflow-y: auto; /* 内容过多时滚动 */
}
.dic-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.dic-row-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.8;
}
.dic-row-label {
  min-width: 4em;
  opacity: 0.9;
}
.dic-row-value {
  margin-left: auto;
  font-weight: 500;
}
.dic-footer {
  height: 3px;
  background: rgba(127, 127, 127, 0.15);
  border-radius: 2px;
  margin-top: 0.5rem;
  flex-shrink: 0;
  overflow: hidden;
}
.dic-bar {
  height: 100%;
  background: var(--primary);
  transition: width 0.1s linear;
}
.dic-fade-enter-from,
.dic-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.dic-fade-enter-active,
.dic-fade-leave-active {
  transition: all 0.25s ease;
}
</style>
