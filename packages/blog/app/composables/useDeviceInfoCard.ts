// ~/composables/useDeviceInfo.ts
export function useDeviceInfo() {
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

    // ① 立即弹出卡片（空数据）
    visible.value = true
    // ② 异步填充（用户无感知）
    Object.assign(info, await DeviceInfoService.getInstance().getDeviceInfo())
  }

  const onContext = (e: MouseEvent) => show(e)

  /* ---------- 长按：无 Intervention 警告 ---------- */
  let longPressTimer: number | null = null
  let longPressStarted = false

  const onTouchStart = (e: TouchEvent) => {
    // 只在可取消时阻止滚动
    if (e.cancelable) e.preventDefault()
    longPressStarted = true
    longPressTimer = window.setTimeout(() => {
      if (longPressStarted) show(e)
    }, 500)
  }

  const onTouchMove = () => {
    // 手指移动则取消长按
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
    document.addEventListener('touchstart', onTouchStart, { passive: false }) // 注意：需可取消
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
