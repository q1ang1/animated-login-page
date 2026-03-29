import { usePreferredLanguages, useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { AppLocale, LoginCopy } from '@/features/login/types'

/** 登录页语言持久化 key，优先级高于浏览器首选语言。 */
export const LANG_STORAGE_KEY = 'lang'

/**
 * 登录页支持的全部中英文文案。
 * 当前先覆盖页面内所有可见文本和常见错误提示。
 */
const LOGIN_COPY: Record<AppLocale, LoginCopy> = {
  en: {
    pageTitle: 'Log in',
    welcomeTitle: 'Welcome back!',
    pageDescription: 'Please enter your details',
    languageLabel: 'Language',
    languageEnglish: 'EN',
    languageChinese: '中文',
    switchToEnglish: 'Switch to English',
    switchToChinese: 'Switch to Chinese',
    themeLabel: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
    switchToDarkTheme: 'Switch to dark theme',
    switchToLightTheme: 'Switch to light theme',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    rememberFor30Days: 'Remember for 30 days',
    forgotPassword: 'Forgot password?',
    logIn: 'Log in',
    signingIn: 'Signing in...',
    logInWithGoogle: 'Log in with Google',
    noAccount: "Don't have an account?",
    signUp: 'Sign Up',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    invalidEmail: 'Please enter a valid email address.',
    passwordTooShort: 'Password must be at least 6 characters.',
    loginFailed: 'Invalid email or password. Please try again.',
    googleLoginFailed: 'Google Sign-In Failed',
  },
  'zh-CN': {
    pageTitle: '登录',
    welcomeTitle: '欢迎回来！',
    pageDescription: '请输入你的登录信息',
    languageLabel: '语言',
    languageEnglish: 'EN',
    languageChinese: '中文',
    switchToEnglish: '切换到英文',
    switchToChinese: '切换到中文',
    themeLabel: '主题',
    themeDark: '深色',
    themeLight: '浅色',
    switchToDarkTheme: '切换到深色主题',
    switchToLightTheme: '切换到浅色主题',
    emailLabel: '邮箱',
    emailPlaceholder: 'you@example.com',
    passwordLabel: '密码',
    passwordPlaceholder: '••••••••',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    rememberFor30Days: '30 天内记住我',
    forgotPassword: '忘记密码？',
    logIn: '登录',
    signingIn: '登录中...',
    logInWithGoogle: '使用 Google 登录',
    noAccount: '还没有账号？',
    signUp: '注册',
    privacyPolicy: '隐私政策',
    termsOfService: '服务条款',
    invalidEmail: '请输入有效的邮箱地址。',
    passwordTooShort: '密码长度至少需要 6 位。',
    loginFailed: '邮箱或密码错误，请重试。',
    googleLoginFailed: 'Google 登录失败',
  },
}

/**
 * 判断缓存中的语言值是否属于当前项目支持的语言集合。
 *
 * @param {string | null | undefined} locale 需要校验的语言值。
 * 常见来源为 `localStorage.getItem('lang')`。
 * @returns {locale is AppLocale} `true` 表示可直接作为界面语言使用。
 *
 * @example
 * isSupportedLocale('en') // true
 * isSupportedLocale('fr') // false
 */
function isSupportedLocale(
  locale: string | null | undefined,
): locale is AppLocale {
  return locale === 'en' || locale === 'zh-CN'
}

/**
 * 把浏览器语言归一化到当前项目支持的语言集合。
 *
 * @param {readonly string[]} languages 浏览器返回的首选语言列表。
 * 一般来自 `navigator.languages` 或 VueUse 的 `usePreferredLanguages()`。
 * @returns {AppLocale} 当前项目支持的语言代码。
 *
 * @example
 * normalizeLocale(['zh-CN', 'en-US']) // 'zh-CN'
 * normalizeLocale(['en-US']) // 'en'
 */
function normalizeLocale(languages: readonly string[]): AppLocale {
  const firstMatch = languages.find(Boolean)?.toLowerCase() ?? 'en'

  if (firstMatch.startsWith('zh')) {
    return 'zh-CN'
  }

  return 'en'
}

/**
 * 解析当前应该使用的语言。
 * 优先使用本地缓存，其次回退到浏览器首选语言。
 *
 * @param {string | null | undefined} storedLocale 本地缓存中的语言值。
 * 一般来自 `localStorage.lang`。
 * @param {readonly string[]} languages 浏览器首选语言列表。
 * @returns {AppLocale} 当前页面应使用的语言。
 *
 * @example
 * resolveLocale('zh-CN', ['en-US']) // 'zh-CN'
 * resolveLocale('', ['zh-HK']) // 'zh-CN'
 */
export function resolveLocale(
  storedLocale: string | null | undefined,
  languages: readonly string[],
): AppLocale {
  if (isSupportedLocale(storedLocale)) {
    return storedLocale
  }

  return normalizeLocale(languages)
}

/**
 * 根据缓存和浏览器语言提供登录页文案，并暴露手动切换能力。
 * 优先级为：`localStorage.lang` > 浏览器首选语言。
 *
 * @returns {{
 *   locale: import('vue').ComputedRef<AppLocale>,
 *   copy: import('vue').ComputedRef<LoginCopy>,
 *   setLocale: (locale: AppLocale) => void,
 *   toggleLocale: () => void
 * }} 当前语言和对应文案。
 *
 * @example
 * const { locale, copy, toggleLocale } = useLoginI18n()
 * console.log(locale.value, copy.value.logIn)
 * toggleLocale()
 */
export function useLoginI18n() {
  /** 浏览器首选语言列表，顺序由浏览器设置决定。 */
  const preferredLanguages = usePreferredLanguages()

  /**
   * 用户手动选择后的语言缓存。
   * 空字符串表示当前尚未手动切换，此时回退到浏览器语言。
   */
  const storedLocale = useStorage<string>(LANG_STORAGE_KEY, '')

  /** 归一化后的当前界面语言。 */
  const locale = computed<AppLocale>(() =>
    resolveLocale(storedLocale.value, preferredLanguages.value),
  )

  /** 当前语言对应的全部登录页文案。 */
  const copy = computed<LoginCopy>(() => LOGIN_COPY[locale.value])

  /**
   * 显式切换当前界面语言，并同步写入本地缓存。
   *
   * @param {AppLocale} nextLocale 目标语言，只支持 `en` 和 `zh-CN`。
   * @returns {void}
   *
   * @example
   * setLocale('zh-CN')
   */
  function setLocale(nextLocale: AppLocale) {
    storedLocale.value = nextLocale
  }

  /**
   * 在中英文之间切换当前语言。
   *
   * @returns {void}
   *
   * @example
   * toggleLocale()
   */
  function toggleLocale() {
    setLocale(locale.value === 'zh-CN' ? 'en' : 'zh-CN')
  }

  return {
    locale,
    copy,
    setLocale,
    toggleLocale,
  }
}
