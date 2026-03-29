import { afterEach } from 'vitest'

/**
 * 清理测试间共享的浏览器状态。
 * 这里统一重置 `localStorage` 与根节点主题标记，避免前一条用例影响后一条。
 */
function resetBrowserState() {
  window.localStorage.clear()
  delete document.documentElement.dataset.theme
}

afterEach(resetBrowserState)
