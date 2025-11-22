<!-- packages/admin/src/components/ThemeToggle.vue -->
<template>
  <el-button text @click="toggleTheme" class="theme-toggle">
    <el-icon :size="20">
      <Moon v-if="isDark" />
      <Sunny v-else />
    </el-icon>
  </el-button>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>
