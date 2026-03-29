<script setup lang="tsx">
import { useTitle } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'
import { defaultBrandConfig } from '@/features/login/config/brand'
import AuthForm from '@/features/login/components/AuthForm.vue'
import BrandLogo from '@/features/login/components/BrandLogo.vue'
import CharacterScene from '@/features/login/components/CharacterScene.vue'
import LanguageToggle from '@/features/login/components/LanguageToggle.vue'
import ThemeToggle from '@/features/login/components/ThemeToggle.vue'
import { useLoginI18n } from '@/features/login/composables/useLoginI18n'
import { useMockAuth } from '@/features/login/composables/useMockAuth'
import { useThemeMode } from '@/features/login/composables/useThemeMode'
import type { AppLocale, BrandConfig, LoginFieldErrors, LoginFormModel, ThemeMode } from '@/features/login/types'

/**
 * 登录页外层可传入的品牌配置。
 * 如果不传，会回退到内置的 `defaultBrandConfig`。
 *
 * @example
 * <LoginPage :brand="defaultBrandConfig" />
 */
interface LoginPageProps {
  /** 当前页面使用的品牌配置，支持传入定制 logo 和链接。 */
  brand?: BrandConfig
}

/** 登录页当前消费的品牌配置。 */
const props = withDefaults(
  defineProps<LoginPageProps>(),
  {
    brand: () => defaultBrandConfig,
  },
)

/**
 * 创建稳定的字段级错误对象。
 * 这里单独抽成函数，是为了在重置错误时始终返回同一份字段结构。
 *
 * @returns {LoginFieldErrors} 默认错误对象，初始值均为空字符串。
 *
 * @example
 * const errors = createErrors()
 * console.log(errors.email) // ''
 */
function createErrors(): LoginFieldErrors {
  return {
    email: '',
    password: '',
  }
}

/**
 * 校验邮箱格式是否满足基础登录要求。
 *
 * @param {string} value 需要校验的邮箱字符串。
 * 支持普通的 `name@example.com` 形式，不处理更复杂的业务规则。
 * @returns {boolean} `true` 表示通过基础格式校验，`false` 表示格式不合法。
 *
 * @example
 * validateEmail('you@example.com') // true
 * validateEmail('invalid-email') // false
 */
function validateEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

/** 登录页当前语言、文案和切换方法。 */
const { locale, copy, setLocale, toggleLocale } = useLoginI18n()

/** 登录页当前主题和切换方法。 */
const { theme, isDark, setTheme } = useThemeMode()

/** 根据品牌名和当前语言生成浏览器标题。 */
const pageTitle = computed(() => `${props.brand.name} · ${copy.value.pageTitle}`)

useTitle(pageTitle)

/** 登录页当前使用的 mock 认证方法，后续可无缝替换为真实接口实现。 */
const { login, loginWithGoogle } = useMockAuth()

/**
 * 登录表单的唯一数据源。
 *
 * @example
 * form.email = 'you@example.com'
 * form.password = 'secret123'
 */
const form = reactive<LoginFormModel>({
  email: '',
  password: '',
  remember: false,
})

/** 映射到邮箱和密码输入框下方的字段级错误文案。 */
const fieldErrors = reactive<LoginFieldErrors>(createErrors())

/** 密码输入框当前是否显示明文。 */
const showPassword = ref(false)

/** 邮箱框聚焦期间的联动状态，会驱动左侧角色互看动画。 */
const isTyping = ref(false)

/** 登录请求进行中的锁定状态，用于禁用按钮和避免重复提交。 */
const isLoading = ref(false)

/** 登录失败时显示在表单中的全局错误提示。 */
const errorMessage = ref('')

/** 主题切换按钮当前应该播报的可访问文案。 */
const nextThemeLabel = computed(() =>
  isDark.value ? copy.value.switchToLightTheme : copy.value.switchToDarkTheme,
)

/** 语言切换按钮当前应该播报的可访问文案。 */
const nextLocaleLabel = computed(() =>
  locale.value === 'zh-CN' ? copy.value.switchToEnglish : copy.value.switchToChinese,
)

/**
 * 响应顶部主题开关的显式切换结果。
 * 主题切换动画已经在 `ThemeToggle` 内部按 Element Plus 官方实现处理，
 * 这里仅负责把最终主题值写回全局状态。
 *
 * @param {ThemeMode} nextTheme 用户最终选择的新主题。
 * @returns {void}
 *
 * @example
 * handleThemeChange('light')
 */
function handleThemeChange(nextTheme: ThemeMode) {
  setTheme(nextTheme)
}

/**
 * 响应顶部语言菜单的显式选择结果。
 *
 * @param {AppLocale} nextLocale 用户从下拉菜单选中的语言代码。
 * @returns {void}
 */
function handleLocaleChange(nextLocale: AppLocale) {
  setLocale(nextLocale)
}

/**
 * 清空字段级错误，避免前一次校验结果残留到下一次提交。
 *
 * @returns {void}
 *
 * @example
 * resetErrors()
 */
function resetErrors() {
  fieldErrors.email = ''
  fieldErrors.password = ''
}

/**
 * 提交前同步校验表单，并把错误直接写回界面字段。
 *
 * @returns {boolean} `true` 表示当前表单可提交，`false` 表示仍有校验错误。
 *
 * @example
 * if (validate()) {
 *   await handleSubmit()
 * }
 */
function validate() {
  resetErrors()

  /** 收集当前提交是否仍然有效；只要任一字段失败就会被置为 false。 */
  let valid = true

  if (!validateEmail(form.email.trim())) {
    fieldErrors.email = copy.value.invalidEmail
    valid = false
  }

  if (form.password.length < 6) {
    fieldErrors.password = copy.value.passwordTooShort
    valid = false
  }

  return valid
}

/**
 * 把 mock 或真实接口返回的错误对象映射成当前语言文案。
 *
 * @param {unknown} authError 登录流程中捕获到的异常对象。
 * @returns {string} 可直接展示到表单中的最终错误文案。
 *
 * @example
 * errorMessage.value = resolveAuthErrorMessage(error)
 */
function resolveAuthErrorMessage(authError: unknown) {
  if (!(authError instanceof Error)) {
    return copy.value.loginFailed
  }

  if (authError.message === 'AUTH_PASSWORD_TOO_SHORT') {
    return copy.value.passwordTooShort
  }

  if (authError.message === 'AUTH_INVALID_CREDENTIALS') {
    return copy.value.loginFailed
  }

  return authError.message
}

/**
 * 本地模拟邮箱登录。
 * 提交期间统一锁定按钮和错误区域，避免重复触发与状态闪烁。
 *
 * @returns {Promise<void>}
 *
 * @example
 * await handleSubmit()
 */
async function handleSubmit() {
  if (isLoading.value) return

  errorMessage.value = ''

  if (!validate()) {
    return
  }

  isLoading.value = true

  try {
    /** 当前仅消费返回文案；后续接真实接口时可改为路由跳转。 */
    const result = await login({ ...form })
    console.info(result.message)
  } catch (authError) {
    errorMessage.value = resolveAuthErrorMessage(authError)
  } finally {
    isLoading.value = false
  }
}

/**
 * 本地模拟 Google 登录入口。
 * 该方法只维护与真实 OAuth 相同的调用边界，不在当前阶段接入后端。
 *
 * @returns {Promise<void>}
 *
 * @example
 * await handleGoogleLogin()
 */
async function handleGoogleLogin() {
  if (isLoading.value) return

  errorMessage.value = ''

  try {
    const result = await loginWithGoogle()
    console.info(result.message)
  } catch (authError) {
    errorMessage.value =
      authError instanceof Error ? resolveAuthErrorMessage(authError) : copy.value.googleLoginFailed
  }
}
</script>

<template>
  <div class="min-h-screen overflow-hidden lg:grid lg:max-h-screen lg:grid-cols-2">
    <section class="login-visual-panel relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      <div class="auth-grid-overlay" />
      <div class="login-visual-blob login-visual-blob--top" />
      <div class="login-visual-blob login-visual-blob--bottom" />

      <div class="relative z-20">
        <BrandLogo :brand="props.brand" />
      </div>

      <div class="relative z-20 flex h-[420px] items-end justify-center overflow-hidden xl:h-[500px]">
        <div class="scene-stage">
          <CharacterScene
            :is-typing="isTyping"
            :show-password="showPassword"
            :password-length="form.password.length"
          />
        </div>
      </div>

      <div class="login-legal-links relative z-20 flex items-center gap-8 text-sm">
        <a :href="props.brand.links.privacyPolicy" class="transition-colors hover:text-[var(--visual-link-hover)]">
          {{ copy.privacyPolicy }}
        </a>
        <a :href="props.brand.links.termsOfService" class="transition-colors hover:text-[var(--visual-link-hover)]">
          {{ copy.termsOfService }}
        </a>
      </div>
    </section>

    <section class="auth-panel relative flex min-h-screen items-center justify-center px-7 py-10 sm:px-8 md:px-10 lg:min-h-0 lg:p-8">
      <div class="absolute right-3 top-3 z-20 flex items-center justify-end gap-1 sm:right-5 sm:top-5 sm:gap-1.5">
        <LanguageToggle
          :locale="locale"
          :language-label="copy.languageLabel"
          :english-label="copy.languageEnglish"
          :chinese-label="copy.languageChinese"
          :next-locale-label="nextLocaleLabel"
          @toggle="toggleLocale"
          @select="handleLocaleChange"
        />
        <ThemeToggle
          :theme="theme"
          :next-theme-label="nextThemeLabel"
          @update:theme="handleThemeChange"
        />
      </div>

      <AuthForm
        :brand="props.brand"
        :copy="copy"
        :email="form.email"
        :password="form.password"
        :remember="form.remember"
        :field-errors="fieldErrors"
        :show-password="showPassword"
        :is-loading="isLoading"
        :error-message="errorMessage"
        @email-input="form.email = $event"
        @password-input="form.password = $event"
        @remember-change="form.remember = $event"
        @toggle-password="showPassword = !showPassword"
        @email-focus="isTyping = true"
        @email-blur="isTyping = false"
        @submit-form="handleSubmit"
        @google-login="handleGoogleLogin"
      />
    </section>
  </div>
</template>

<style scoped>
.scene-stage {
  transform: scale(0.74);
  transform-origin: bottom center;
}

@media (min-width: 1280px) {
  .scene-stage {
    transform: scale(0.88);
  }
}

@media (min-width: 1450px) {
  .scene-stage {
    transform: scale(1);
  }
}
</style>
