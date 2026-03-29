import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, nextTick } from 'vue'
import { THEME_STORAGE_KEY, useThemeMode } from '@/features/login/composables/useThemeMode'

const originalMatchMedia = window.matchMedia

/**
 * 用测试指定的系统主题覆盖浏览器偏好。
 *
 * @param {boolean} matchesDark 当前系统是否偏好深色主题。
 * @returns {void}
 */
function mockMatchMedia(matchesDark: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? matchesDark : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  })
})

describe('useThemeMode', () => {
  it('在没有缓存时默认跟随系统主题并同步根节点标记', async () => {
    mockMatchMedia(true)

    const scope = effectScope()
    const { theme, themePreference, systemTheme, isDark } = scope.run(() => useThemeMode())!

    await nextTick()

    expect(theme.value).toBe('dark')
    expect(themePreference.value).toBe('auto')
    expect(systemTheme.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()

    scope.stop()
  })

  it('支持读取缓存并在切换后写回 data-theme、class 和 localStorage', async () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')

    const scope = effectScope()
    const { theme, themePreference, isDark, setTheme, toggleTheme } = scope.run(() => useThemeMode())!

    await nextTick()

    expect(theme.value).toBe('light')
    expect(themePreference.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    setTheme('dark')
    await nextTick()

    expect(theme.value).toBe('dark')
    expect(themePreference.value).toBe('dark')
    expect(isDark.value).toBe(true)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    toggleTheme()
    await nextTick()

    expect(theme.value).toBe('light')
    expect(themePreference.value).toBe('light')
    expect(isDark.value).toBe(false)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    scope.stop()
  })

  it('支持在 auto 跟随系统时切到显式主题并写入缓存', async () => {
    mockMatchMedia(true)

    const scope = effectScope()
    const { theme, themePreference, toggleTheme } = scope.run(() => useThemeMode())!

    await nextTick()

    expect(theme.value).toBe('dark')
    expect(themePreference.value).toBe('auto')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull()

    toggleTheme()
    await nextTick()

    expect(theme.value).toBe('light')
    expect(themePreference.value).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')

    scope.stop()
  })
})
