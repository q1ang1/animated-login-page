import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import {
  LANG_STORAGE_KEY,
  resolveLocale,
  useLoginI18n,
} from '@/features/login/composables/useLoginI18n'

const originalLanguage = navigator.language
const originalLanguages = navigator.languages

/**
 * 用测试指定的语言列表覆盖浏览器语言环境。
 *
 * @param {string[]} languages 当前测试希望模拟的浏览器语言优先级。
 * @returns {void}
 *
 * @example
 * mockNavigatorLanguages(['zh-CN', 'en-US'])
 */
function mockNavigatorLanguages(languages: string[]) {
  const firstLanguage = languages[0] ?? 'en-US'

  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    value: firstLanguage,
  })

  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    value: languages,
  })
}

afterEach(() => {
  Object.defineProperty(window.navigator, 'language', {
    configurable: true,
    value: originalLanguage,
  })

  Object.defineProperty(window.navigator, 'languages', {
    configurable: true,
    value: originalLanguages,
  })
})

describe('useLoginI18n', () => {
  it('优先使用 localStorage.lang 中的语言配置', () => {
    mockNavigatorLanguages(['en-US'])
    window.localStorage.setItem(LANG_STORAGE_KEY, 'zh-CN')

    const { locale, copy } = useLoginI18n()

    expect(locale.value).toBe('zh-CN')
    expect(copy.value.logIn).toBe('登录')
  })

  it('在没有缓存时回退到浏览器首选语言', () => {
    mockNavigatorLanguages(['zh-HK', 'en-US'])

    const { locale, copy } = useLoginI18n()

    expect(locale.value).toBe('zh-CN')
    expect(copy.value.pageTitle).toBe('登录')
  })

  it('支持手动切换语言并写回 localStorage', async () => {
    mockNavigatorLanguages(['en-US'])

    const { locale, setLocale, toggleLocale } = useLoginI18n()

    expect(locale.value).toBe('en')

    toggleLocale()
    await nextTick()
    expect(locale.value).toBe('zh-CN')
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('zh-CN')

    setLocale('en')
    await nextTick()
    expect(locale.value).toBe('en')
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('en')
  })

  it('按缓存优先级解析最终语言', () => {
    expect(resolveLocale('en', ['zh-CN'])).toBe('en')
    expect(resolveLocale('', ['zh-CN'])).toBe('zh-CN')
  })
})
