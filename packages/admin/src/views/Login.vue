<!-- packages/admin/src/views/Login.vue -->
<template>
  <div class="login-page">
    <div class="global-header">
      <div class="header-actions">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <h1 class="logo-text">{{ appName }}</h1>
          <p class="welcome-text">{{ appLocale.login.welcome }}</p>
          <p class="subtitle-text">{{ appLocale.login.subtitle }}</p>
        </div>

        <el-form
          ref="formRef"
          :model="formValue"
          :rules="rules"
          size="large"
          class="login-form"
          @submit.prevent
          :label-width="65"
        >
          <el-form-item :label="appLocale.login.username" prop="username">
            <el-input
              v-model="formValue.username"
              :placeholder="appLocale.login.usernamePlaceholder"
              clearable
              class="custom-input"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="appLocale.login.password" prop="password">
            <el-input
              v-model="formValue.password"
              type="password"
              :placeholder="appLocale.login.passwordPlaceholder"
              clearable
              show-password
              @keyup.enter="handleLogin"
              class="custom-input"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe">
              {{ appLocale.login.rememberMe }}
            </el-checkbox>
            <el-link type="primary" class="forgot-link">
              {{ appLocale.login.forgotPassword }}
            </el-link>
          </div>

          <el-button
            type="primary"
            size="large"
            round
            :loading="loading"
            @click="handleLogin"
            class="login-button"
          >
            {{ appLocale.login.loginBtn }}
          </el-button>
        </el-form>

        <div class="login-footer">
          <p class="copyright-line-1">{{ copyrightLine1 }}</p>
          <p class="copyright-line-2">{{ copyrightLine2 }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { loginApi } from '@/apis/auth'
import { useLocaleStore } from '@/stores/locale'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

const localeStore = useLocaleStore()
const { appLocale } = storeToRefs(localeStore)
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 应用名称来自环境变量（例如：Zero Point）
const appName = import.meta.env.VITE_APP_NAME || 'Admin System'

const formRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

const formValue = reactive({
  username: '',
  password: '',
})

const rules = {
  username: [
    {
      required: true,
      message: () => appLocale.value.login.usernameRequired,
      trigger: ['blur', 'input'],
    },
  ],
  password: [
    {
      required: true,
      message: () => appLocale.value.login.passwordRequired,
      trigger: ['blur', 'input'],
    },
    {
      min: 6,
      message: () => appLocale.value.login.passwordMinLength,
      trigger: ['blur', 'input'],
    },
  ],
}

const currentYear = new Date().getFullYear()

// 版权信息中替换 {year} 和 {appName}
const copyrightLine1 = computed(() =>
  appLocale.value.login.copyright.line1
    .replace('{year}', String(currentYear))
    .replace('{appName}', appName)
)
const copyrightLine2 = computed(() =>
  appLocale.value.login.copyright.line2.replace('{appName}', appName)
)

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    const response = await loginApi({
      username: formValue.username,
      password: formValue.password,
    })

    if (response.success) {
      ElMessage.success(appLocale.value.login.success)
      if (rememberMe.value) localStorage.setItem('rememberMe', 'true')

      // ✅ 关键修改：不要手动设 isAuthenticated，而是刷新认证状态
      await authStore.checkAuth(true) // force = true 强制拉取最新用户信息

      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } else {
      ElMessage.error(response.message || appLocale.value.login.failed)
    }
  } catch (errors) {
    console.log('Validation failed:', errors)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--login-bg);
  transition: all 0.3s ease;
}

.global-header {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-card {
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease-out;
  color: var(--n-text-color);
}

.logo-section {
  text-align: center;
  margin-bottom: 40px;

  .logo-text {
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #667eea, #764ba2);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 12px;
  }

  .welcome-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--n-text-color);
    margin-bottom: 6px;
  }

  .subtitle-text {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
    opacity: 0.9;
  }
}

/* ... 其余样式保持不变 ... */
.login-form {
  .el-form-item {
    margin-bottom: 24px;
  }

  :deep(.custom-input.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.1) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(10px);
    box-shadow: none !important;

    input {
      color: var(--n-text-color) !important;
      &::placeholder {
        color: var(--text-secondary) !important;
      }
    }

    &:focus-within {
      border-color: #667eea !important;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2) !important;
    }
  }
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.login-footer {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--text-secondary);
  line-height: 1.4;

  .copyright-line-1 {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0 0 4px;
    font-weight: 500;
  }

  .copyright-line-2 {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 0;
    opacity: 0.8;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .global-header {
    top: 16px;
    right: 16px;
  }

  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 30px 24px;
  }

  .logo-section {
    .logo-text {
      font-size: 28px;
    }

    .welcome-text {
      font-size: 16px;
    }
  }
}
</style>
