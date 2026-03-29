import { afterEach } from 'vitest'

/**
 * 统一清理测试间共享的浏览器状态，避免 `localStorage` 和主题残留影响下一条用例。
 */
afterEach(() => {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
})
