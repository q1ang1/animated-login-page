import { useColorMode } from '@vueuse/core'
import { computed } from 'vue'
import type { ThemeMode, ThemePreference } from '@/features/login/types'

export const THEME_STORAGE_KEY = 'animated-login-theme'

/**
 * 管理登录页的主题模式，并同步到根节点的 `data-theme`。
 * 首次进入时默认跟随系统主题；一旦用户手动切换，就持久化显式的深浅色选择。
 *
 * @returns {{
 *   theme: import('vue').ComputedRef<ThemeMode>,
 *   themePreference: import('vue').ComputedRef<ThemePreference>,
 *   systemTheme: import('vue').ComputedRef<ThemeMode>,
 *   isDark: import('vue').ComputedRef<boolean>,
 *   setTheme: (theme: ThemeMode) => void,
 *   toggleTheme: () => void
 * }} 当前主题状态和切换方法。
 *
 * @example
 * const { theme, setTheme } = useThemeMode()
 * setTheme('light')
 */
export function useThemeMode() {
  const hasStoredPreference = window.localStorage.getItem(THEME_STORAGE_KEY) !== null

  const colorMode = useColorMode<ThemeMode>({
    selector: 'html',
    attribute: 'data-theme',
    initialValue: 'auto',
    storageKey: THEME_STORAGE_KEY,
    onChanged(mode, defaultHandler) {
      defaultHandler(mode)
      document.documentElement.classList.toggle('dark', mode === 'dark')
    },
  })

  if (!hasStoredPreference && colorMode.store.value === 'auto') {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  }

  /** 当前页面真正生效的主题。 */
  const theme = computed<ThemeMode>(() => colorMode.state.value)

  /** 用户当前存储的主题偏好。 */
  const themePreference = computed<ThemePreference>(() => colorMode.store.value)

  /** 当前系统偏好的主题。 */
  const systemTheme = computed<ThemeMode>(() => colorMode.system.value)

  /** 当前是否处于深色主题。 */
  const isDark = computed(() => theme.value === 'dark')

  /**
   * 显式设置当前主题。
   * `ElSwitch` 这类表单控件更适合使用确定值，而不是只暴露反转动作。
   *
   * @param {ThemeMode} nextTheme 目标主题，只支持 `dark` 和 `light`。
   * @returns {void}
   *
   * @example
   * setTheme('dark')
   */
  function setTheme(nextTheme: ThemeMode) {
    colorMode.value = nextTheme
  }

  /**
   * 在当前实际生效的深浅两套主题间切换。
   * 如果当前仍处于 `auto` 跟随系统，则会写入与当前实际主题相反的显式模式。
   *
   * @returns {void}
   *
   * @example
   * toggleTheme()
   */
  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return {
    theme,
    themePreference,
    systemTheme,
    isDark,
    setTheme,
    toggleTheme,
  }
}
