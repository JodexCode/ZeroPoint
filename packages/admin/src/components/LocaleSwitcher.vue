<!-- packages/admin/src/components/LocaleSwitcher.vue -->
<template>
  <el-dropdown
    trigger="click"
    @command="handleSelect"
    placement="bottom-end"
    class="locale-switcher"
  >
    <el-button text>
      <el-icon><Operation /></el-icon>
      {{ currentLabel }}
    </el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="l in locales"
          :key="l.value"
          :command="l.value"
          :disabled="localeStore.current === l.value"
        >
          {{ l.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Operation } from '@element-plus/icons-vue'
import { useLocaleStore } from '@/stores/locale'

const localeStore = useLocaleStore()

const locales = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

const currentLabel = computed(() => {
  const current = locales.find(l => l.value === localeStore.current)
  return current ? current.label : 'Language'
})

const handleSelect = (value: string) => {
  console.log(' 切换语言前:', localeStore.current)
  localeStore.setLocale(value as any)
  console.log(' 切换语言后:', localeStore.current)
}
</script>
