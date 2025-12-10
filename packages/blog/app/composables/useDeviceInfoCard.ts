// ~/composables/useDeviceInfo.ts
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import type { DeviceInfo } from '~/utils/deviceInfo'
import { DeviceInfoService } from '~/utils/deviceInfo'

export function useDeviceInfo() {
  // 🔒 服务端直接返回空状态
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
    }
  }

  // 👇 以下全是客户端逻辑
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

    e.preventDefault()
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
    if (e.cancelable) e.preventDefault()
    longPressStarted = true
    longPressTimer = window.setTimeout(() => {
      if (longPressStarted) show(e)
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

  onMounted(() => {
    document.addEventListener('contextmenu', onContext)
    document.addEventListener('touchstart', onTouchStart, { passive: false })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)
  })

  onUnmounted(() => {
    document.removeEventListener('contextmenu', onContext)
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
  })

  return { visible, info, pos }
}
