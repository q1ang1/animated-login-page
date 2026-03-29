import { useStorage } from '@vueuse/core'
import { computed, watch } from 'vue'
import type { ThemeMode } from '@/features/login/types'

const THEME_STORAGE_KEY = 'animated-login-theme'

/**
 * 管理登录页的主题模式，并同步到根节点的 `data-theme`。
 * 这里默认使用当前项目已经完成的深色视觉，浅色作为新增补充主题。
 *
 * @returns {{
 *   theme: import('vue').ComputedRef<ThemeMode>,
 *   isDark: import('vue').ComputedRef<boolean>,
 *   toggleTheme: () => void
 * }} 当前主题状态和切换方法。
 *
 * @example
 * const { theme, toggleTheme } = useThemeMode()
 * toggleTheme()
 */
export function useThemeMode() {
  /**
   * 用户持久化的主题偏好。
   * 如果用户从未切换过主题，会默认回退到 `dark`。
   */
  const storedTheme = useStorage<ThemeMode>(THEME_STORAGE_KEY, 'dark')

  /** 当前实际使用的主题值。 */
  const theme = computed<ThemeMode>(() => storedTheme.value ?? 'dark')

  /** 当前是否处于深色主题。 */
  const isDark = computed(() => theme.value === 'dark')

  /**
   * 在深浅两套主题间切换。
   *
   * @returns {void}
   *
   * @example
   * toggleTheme()
   */
  function toggleTheme() {
    storedTheme.value = isDark.value ? 'light' : 'dark'
  }

  /**
   * 监听主题值并同步到根节点属性。
   * 这样全局 CSS 变量可以通过 `[data-theme="dark"]` / `[data-theme="light"]` 生效。
   */
  watch(
    theme,
    (value) => {
      document.documentElement.dataset.theme = value
    },
    { immediate: true },
  )

  return {
    theme,
    isDark,
    toggleTheme,
  }
}
