<!-- packages/admin/src/components/ImageCropper.vue -->
<template>
  <el-dialog
    v-model="show"
    title="裁剪头像"
    width="800px"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <div class="cropper-container" v-if="imageSrc">
      <!-- 裁剪区 -->
      <div class="crop-area" ref="cropAreaRef">
        <img ref="imageRef" :src="imageSrc" alt="原图" @load="onImageLoad" />
        <div
          ref="cropBoxRef"
          class="crop-box"
          @mousedown="handleMouseDown"
          @wheel.prevent="handleWheel"
        ></div>
        <div class="resize-tip">💡 鼠标悬停在裁剪框内，滚动滚轮可调整大小</div>
      </div>

      <!-- 预览区 -->
      <div class="preview-section">
        <p>预览（圆形）</p>
        <canvas ref="previewCanvasRef" width="120" height="120"></canvas>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="confirmCrop" :loading="loading"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  imageSrc: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'crop', blob: Blob): void
}>()

const show = ref(false)
const loading = ref(false)

// refs
const cropAreaRef = ref<HTMLDivElement | null>(null)
const imageRef = ref<HTMLImageElement | null>(null)
const cropBoxRef = ref<HTMLDivElement | null>(null)
const previewCanvasRef = ref<HTMLCanvasElement | null>(null)

// 裁剪状态（基于原始图坐标）
const cropState = ref({
  x: 0,
  y: 0,
  width: 200,
  height: 200,
})

// 拖拽状态
const isDragging = ref(false)

// 同步弹窗显示
watch(
  () => props.modelValue,
  val => {
    show.value = val
  },
  { immediate: true }
)

// 图片加载完成
const onImageLoad = () => {
  initCropBox()
}

// 初始化裁剪框（居中，60% 原图尺寸）
const initCropBox = () => {
  if (!imageRef.value || !cropAreaRef.value) return

  const imgWidth = imageRef.value.naturalWidth
  const imgHeight = imageRef.value.naturalHeight
  const boxSize = Math.min(imgWidth, imgHeight) * 0.6

  cropState.value = {
    x: (imgWidth - boxSize) / 2,
    y: (imgHeight - boxSize) / 2,
    width: boxSize,
    height: boxSize,
  }

  updateCropBoxStyle()
  updatePreview()
}

// 获取显示比例
const getDisplayScale = (): number => {
  if (!imageRef.value || !cropAreaRef.value) return 1
  return cropAreaRef.value.clientWidth / imageRef.value.naturalWidth
}

// 更新裁剪框样式（转换为显示坐标）
const updateCropBoxStyle = () => {
  const scale = getDisplayScale()
  if (!cropBoxRef.value) return

  const style = cropBoxRef.value.style
  style.left = `${cropState.value.x * scale}px`
  style.top = `${cropState.value.y * scale}px`
  style.width = `${cropState.value.width * scale}px`
  style.height = `${cropState.value.height * scale}px`
}

// 更新预览图
const updatePreview = () => {
  if (!previewCanvasRef.value || !imageRef.value) return
  const ctx = previewCanvasRef.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, 120, 120)
  ctx.save()
  ctx.beginPath()
  ctx.arc(60, 60, 60, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(
    imageRef.value!,
    cropState.value.x,
    cropState.value.y,
    cropState.value.width,
    cropState.value.height,
    0,
    0,
    120,
    120
  )
  ctx.restore()
}

// 滚轮缩放裁剪框
const handleWheel = (e: WheelEvent) => {
  if (!imageRef.value) return

  const imgW = imageRef.value.naturalWidth
  const imgH = imageRef.value.naturalHeight
  const minSize = 50
  const maxSize = Math.min(imgW, imgH)

  // 计算当前中心点（原始图坐标）
  const centerX = cropState.value.x + cropState.value.width / 2
  const centerY = cropState.value.y + cropState.value.height / 2

  // 滚轮方向：deltaY > 0 表示向下滚动（放大裁剪区域）
  const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
  let newSize = cropState.value.width * zoomFactor

  // 限制范围
  newSize = Math.max(minSize, Math.min(newSize, maxSize))

  // 保持中心不变，重新计算 x, y
  const newX = centerX - newSize / 2
  const newY = centerY - newSize / 2

  // 边界保护
  const finalX = Math.max(0, Math.min(newX, imgW - newSize))
  const finalY = Math.max(0, Math.min(newY, imgH - newSize))

  cropState.value = {
    x: finalX,
    y: finalY,
    width: newSize,
    height: newSize,
  }

  updateCropBoxStyle()
  updatePreview()
}

// 鼠标按下（开始拖拽）
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  e.preventDefault()
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 鼠标移动（拖拽）
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value || !cropAreaRef.value || !imageRef.value) return

  const rect = cropAreaRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  const scale = getDisplayScale()
  const imgX = mouseX / scale
  const imgY = mouseY / scale

  const halfW = cropState.value.width / 2
  const halfH = cropState.value.height / 2

  let newX = imgX - halfW
  let newY = imgY - halfH

  const imgW = imageRef.value.naturalWidth
  const imgH = imageRef.value.naturalHeight

  newX = Math.max(0, Math.min(newX, imgW - cropState.value.width))
  newY = Math.max(0, Math.min(newY, imgH - cropState.value.height))

  cropState.value.x = newX
  cropState.value.y = newY

  updateCropBoxStyle()
  updatePreview()
}

// 鼠标抬起（结束拖拽）
const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// 确认裁剪
const confirmCrop = () => {
  if (!imageRef.value) return

  loading.value = true
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')

    ctx.drawImage(
      imageRef.value,
      cropState.value.x,
      cropState.value.y,
      cropState.value.width,
      cropState.value.height,
      0,
      0,
      400,
      400
    )

    canvas.toBlob(blob => {
      if (!blob) throw new Error('Blob creation failed')
      emit('crop', blob)
      handleClose()
    }, 'image/png')
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.cropper-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.crop-area {
  position: relative;
  flex: 1;
  min-height: 400px;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
}

.crop-area img {
  display: block;
  width: 100%;
  height: auto;
}

.crop-box {
  position: absolute;
  border: 2px dashed var(--el-color-primary);
  background-color: rgba(64, 158, 255, 0.1);
  z-index: 10;
  cursor: move;
}

.preview-section {
  text-align: center;
}

.preview-section p {
  margin-bottom: 10px;
  font-weight: 500;
}

.preview-section canvas {
  border-radius: 50%;
  border: 1px solid var(--el-border-color);
}

.resize-tip {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 9;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.crop-box:hover ~ .resize-tip,
.resize-tip:hover {
  opacity: 1;
}
</style>
