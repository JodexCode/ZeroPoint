<template>
  <form class="app-search-box" :class="{ 'has-text': keyword }" @submit.prevent="handleSubmit">
    <input
      ref="inputRef"
      v-model="keyword"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      class="input"
      @input="onInput"
      @keydown.esc="clear"
    />
    <button type="button" class="clear-btn" @click="clear" aria-label="清空"></button>
    <button type="submit" class="btn" aria-label="搜索">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="11" cy="11" r="8" stroke-width="2" />
        <path d="m21 21-4.35-4.35" stroke-width="2" />
      </svg>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebounce } from '@/composables/useDebounce'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
  }>(),
  { placeholder: '搜索标题 / 摘要 / 拼音' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'search', v: string): void
}>()

const keyword = ref(props.modelValue ?? '')
const inputRef = ref<HTMLInputElement>()

/* 防抖输入 */
const onInput = useDebounce(() => {
  emit('update:modelValue', keyword.value.trim())
  emit('search', keyword.value.trim())
}, 300)

watch(
  () => props.modelValue,
  v => (keyword.value = v ?? '')
)

/* 清空 */
function clear() {
  keyword.value = ''
  inputRef.value?.focus()
  emit('search', '')
}

/* 回车搜索 */
function handleSubmit() {
  emit('search', keyword.value.trim())
}
</script>

<style scoped lang="scss">
.app-search-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 480px;
  margin: 0 auto 2rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 2rem;
  padding: 0.4rem 0.6rem;
  backdrop-filter: blur(8px);
  transition: box-shadow 0.3s;
  &:focus-within {
    box-shadow: 0 0 0 2px var(--primary);
  }

  .input {
    flex: 1 1 auto;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text);
    font-size: 0.95rem;
  }

  .btn {
    flex: 0 0 28px;
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border: none;
    background: var(--primary);
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.08);
    }
  }
}
.clear-btn {
  flex: 0 0 20px;
  position: relative;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;

  /* ✅ 有内容就显示，不 hover */
  .has-text & {
    opacity: 1;
    pointer-events: auto;
  }

  /* 画 × */
  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 12px;
    height: 2px;
    transform-origin: center;
    background: var(--primary);
  }
  &::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }
  &::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }
}
@media (max-width: 360px) {
  .app-search-box {
    font-size: 0.875rem;
    border-radius: 8px;
    padding: 0.35rem 0.5rem;
  }
}
</style>
