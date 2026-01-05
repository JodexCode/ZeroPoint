// packages\blog\app\composables\useDeviceInfoCard.ts
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import type { DeviceInfo } from '~/utils/deviceInfo'
import { DeviceInfoService } from '~/utils/deviceInfo'

export function useDeviceInfo() {
  if (process.server) {
    return {
      visible: ref(false),
      info: reactive({
        deviceModel: '',
        systemVersion: '',
        networkType: '',
        networkSpeed: '',
      }),
      pos: ref({ x: 0, y: 0 }),
      show: () => {},
    }
  }

  const visible = ref(false)
  const info = reactive<DeviceInfo>({
    deviceModel: '检测中...',
    systemVersion: '检测中...',
    networkType: '检测中...',
    networkSpeed: '检测中...',
  })
  const pos = ref({ x: 0, y: 0 })

  const isInteractive = (el: HTMLElement) =>
    ['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'A', 'VIDEO', 'AUDIO'].includes(el.tagName) ||
    el.isContentEditable ||
    !!el.closest('[contenteditable]')

  const hasSelection = () => !!window.getSelection()?.toString().length

  const show = async (e: MouseEvent | TouchEvent) => {
    if (hasSelection()) return
    const target = e.composedPath().find(t => t instanceof HTMLElement) as HTMLElement
    if (target && isInteractive(target)) return

    if (e instanceof MouseEvent) {
      e.preventDefault()
    }
    const touch = e instanceof MouseEvent ? e : e.touches?.[0] || e.changedTouches?.[0]
    if (!touch) return
    pos.value = { x: touch.clientX, y: touch.clientY }
    visible.value = false
    await nextTick()
    visible.value = true
    Object.assign(info, await DeviceInfoService.getInstance().getDeviceInfo())
  }
  const onContext = (e: MouseEvent) => show(e)

  let longPressTimer: number | null = null
  let longPressStarted = false

  const onTouchStart = (e: TouchEvent) => {
    longPressStarted = true
    longPressTimer = window.setTimeout(() => {
      if (longPressStarted) {
        // 只在真正触发长按时，阻止默认上下文菜单（可选）
        if (e.cancelable) e.preventDefault()
        show(e)
      }
    }, 500)
  }

  const onTouchMove = () => {
    longPressStarted = false
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  const onTouchEnd = () => {
    longPressStarted = false
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
  }

  // 绑定到 window，同时支持 PC 右键和移动端长按
  onMounted(() => {
    window.addEventListener('contextmenu', onContext)
    window.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
  })

  onUnmounted(() => {
    window.removeEventListener('contextmenu', onContext)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
  })

  return { visible, info, pos, show }
}
