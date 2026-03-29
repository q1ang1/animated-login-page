<script setup lang="tsx">
import eyeOffIcon from '@/assets/icons/eye-off.svg'
import eyeOpenIcon from '@/assets/icons/eye-open.svg'
import googleIcon from '@/assets/icons/google.svg'
import BrandLogo from '@/features/login/components/BrandLogo.vue'
import InteractiveButton from '@/features/login/components/InteractiveButton.vue'
import SvgMaskIcon from '@/features/login/components/SvgMaskIcon.vue'
import { computed } from 'vue'
import type { BrandConfig, LoginCopy, LoginFieldErrors } from '@/features/login/types'

/**
 * 登录表单组件的 props 契约。
 * 该组件本身不持有表单状态，只消费父层传入的值并抛出事件。
 *
 * @example
 * const props: AuthFormProps = {
 *   brand: defaultBrandConfig,
 *   copy,
 *   email: 'you@example.com',
 *   password: 'secret123',
 *   remember: false,
 *   fieldErrors: { email: '', password: '' },
 *   showPassword: false,
 *   isLoading: false,
 *   errorMessage: '',
 * }
 */
interface AuthFormProps {
  /** 当前品牌配置，供移动端 logo 和链接地址使用。 */
  brand: BrandConfig
  /** 当前语言下的全部登录页文案。 */
  copy: LoginCopy
  /** 邮箱输入框当前值。 */
  email: string
  /** 密码输入框当前值。 */
  password: string
  /** 是否勾选“Remember for 30 days”。 */
  remember: boolean
  /** 字段级错误信息对象。 */
  fieldErrors: LoginFieldErrors
  /** 当前是否展示密码明文。 */
  showPassword: boolean
  /** 表单是否处于提交锁定状态。 */
  isLoading: boolean
  /** 表单级错误提示文案。 */
  errorMessage: string
}

/**
 * 登录表单向页面容器抛出的事件契约。
 *
 * @example
 * emit('emailInput', 'you@example.com')
 * emit('togglePassword')
 */
interface AuthFormEmits {
  /** 邮箱输入变化。 */
  emailInput: [value: string]
  /** 密码输入变化。 */
  passwordInput: [value: string]
  /** 记住我勾选状态变化。 */
  rememberChange: [value: boolean]
  /** 点击密码显隐按钮。 */
  togglePassword: []
  /** 邮箱输入框获得焦点。 */
  emailFocus: []
  /** 邮箱输入框失去焦点。 */
  emailBlur: []
  /** 请求父层执行表单提交。 */
  submitForm: []
  /** 请求父层执行 Google 登录。 */
  googleLogin: []
}

/** 当前表单消费的父层状态。 */
const props = defineProps<AuthFormProps>()

/** 当前表单向父层回传的交互事件。 */
const emit = defineEmits<AuthFormEmits>()

/**
 * 密码显隐按钮当前使用的图标资源。
 * 这里通过静态 SVG 资源切换，不再在模板里内联图标路径。
 *
 * @returns {string} 当前应展示的静态图标资源 URL。
 *
 * @example
 * passwordToggleIcon.value
 */
const passwordToggleIcon = computed(() =>
  props.showPassword ? eyeOffIcon : eyeOpenIcon,
)

/**
 * 阻止原生提交，统一把提交时机交给页面容器层处理。
 *
 * @param {Event} event 原生表单提交事件。
 * @returns {void}
 *
 * @example
 * <form @submit="handleSubmit">
 */
function handleSubmit(event: Event) {
  event.preventDefault()
  emit('submitForm')
}

/**
 * 把邮箱输入值同步到父组件。
 *
 * @param {Event} event 输入框的原生 input 事件。
 * 事件目标必须是 `HTMLInputElement`。
 * @returns {void}
 *
 * @example
 * <input @input="handleEmailInput" />
 */
function handleEmailInput(event: Event) {
  emit('emailInput', (event.target as HTMLInputElement).value)
}

/**
 * 把密码输入值同步到父组件。
 * 父组件拿到最新密码长度后，会继续驱动左侧角色动画。
 *
 * @param {Event} event 输入框的原生 input 事件。
 * 事件目标必须是 `HTMLInputElement`。
 * @returns {void}
 *
 * @example
 * <input @input="handlePasswordInput" />
 */
function handlePasswordInput(event: Event) {
  emit('passwordInput', (event.target as HTMLInputElement).value)
}

/**
 * 把“Remember for 30 days”的勾选状态回传给父层。
 *
 * @param {Event} event checkbox 的 change 事件。
 * 事件目标必须是 `HTMLInputElement`。
 * @returns {void}
 *
 * @example
 * <input type="checkbox" @change="handleRememberChange" />
 */
function handleRememberChange(event: Event) {
  emit('rememberChange', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div class="w-full max-w-[420px]">
    <div class="mb-12 flex items-center justify-center text-lg font-semibold lg:hidden">
      <BrandLogo :brand="props.brand" mobile />
    </div>

    <div class="mb-10 text-center">
      <h1 class="mb-2 text-3xl font-bold tracking-tight">{{ props.copy.welcomeTitle }}</h1>
      <p class="text-sm text-[var(--muted-foreground)]">
        {{ props.copy.pageDescription }}
      </p>
    </div>

    <form class="space-y-5" @submit="handleSubmit">
      <div class="space-y-2">
        <label for="email" class="text-sm font-medium">{{ props.copy.emailLabel }}</label>
        <input
          id="email"
          name="email"
          type="email"
          :placeholder="props.copy.emailPlaceholder"
          autocomplete="email"
          :value="props.email"
          class="auth-input"
          @input="handleEmailInput"
          @focus="emit('emailFocus')"
          @blur="emit('emailBlur')"
        />
        <p v-if="props.fieldErrors.email" class="text-sm text-[var(--destructive)]">
          {{ props.fieldErrors.email }}
        </p>
      </div>

      <div class="space-y-2">
        <label for="password" class="text-sm font-medium">{{ props.copy.passwordLabel }}</label>
        <div class="relative">
          <input
            id="password"
            name="password"
            :type="props.showPassword ? 'text' : 'password'"
            :placeholder="props.copy.passwordPlaceholder"
            autocomplete="current-password"
            :value="props.password"
            class="auth-input auth-input-password"
            @input="handlePasswordInput"
          />
          <button
            type="button"
            :aria-label="props.showPassword ? props.copy.hidePassword : props.copy.showPassword"
            :title="props.showPassword ? props.copy.hidePassword : props.copy.showPassword"
            class="icon-button-reset absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            @click="emit('togglePassword')"
          >
            <SvgMaskIcon :icon="passwordToggleIcon" size="1.25rem" />
          </button>
        </div>
        <p v-if="props.fieldErrors.password" class="text-sm text-[var(--destructive)]">
          {{ props.fieldErrors.password }}
        </p>
      </div>

      <div class="flex items-center justify-between gap-4">
        <label class="flex items-center space-x-2">
          <input
            id="remember"
            name="remember"
            type="checkbox"
            :checked="props.remember"
            class="auth-checkbox"
            @change="handleRememberChange"
          />
          <span class="cursor-pointer text-sm font-normal">{{ props.copy.rememberFor30Days }}</span>
        </label>

        <a
          :href="props.brand.links.forgotPassword"
          class="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          {{ props.copy.forgotPassword }}
        </a>
      </div>

      <div
        v-if="props.errorMessage"
        class="rounded-lg border border-[rgba(232,106,106,0.3)] bg-[rgba(232,106,106,0.1)] p-3 text-sm text-[var(--destructive)]"
      >
        {{ props.errorMessage }}
      </div>

      <InteractiveButton
        type="submit"
        :text="props.isLoading ? props.copy.signingIn : props.copy.logIn"
        :disabled="props.isLoading"
        class-name="auth-submit-button h-12 w-full text-base font-medium"
      />
    </form>

    <div class="mt-6">
      <InteractiveButton
        type="button"
        :text="props.copy.logInWithGoogle"
        class-name="auth-social-button h-12 w-full text-base font-semibold"
        @click="emit('googleLogin')"
      >
        <template #icon>
          <SvgMaskIcon :icon="googleIcon" size="1.25rem" />
        </template>
      </InteractiveButton>
    </div>

    <div class="mt-8 text-center text-sm text-[var(--muted-foreground)]">
      {{ props.copy.noAccount }}
      <span class="mx-[2px] inline-block"> </span>
      <a
        :href="props.brand.links.signUp"
        class="font-medium text-[var(--foreground)] hover:underline"
      >
        {{ props.copy.signUp }}
      </a>
    </div>
  </div>
</template>
