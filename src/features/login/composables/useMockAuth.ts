import type { LoginPayload, MockAuthResult } from '@/features/login/types'

/**
 * 统一模拟认证耗时，便于在不接真实接口时保留异步交互节奏。
 *
 * @param {number} duration 需要等待的毫秒数。
 * 传入正整数即可，例如 `980` 表示等待约 0.98 秒。
 * @returns {Promise<void>} 到时后 resolve 的 Promise。
 *
 * @example
 * await wait(720)
 */
function wait(duration: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

/**
 * 提供登录页当前使用的本地 mock 认证能力。
 * 当前返回结构故意贴近真实接口，后续切换网络请求时只需要替换实现。
 *
 * @returns {{
 *   login: (payload: LoginPayload) => Promise<MockAuthResult>,
 *   loginWithGoogle: () => Promise<MockAuthResult>
 * }} 登录页使用的 mock 认证方法集合。
 *
 * @example
 * const { login, loginWithGoogle } = useMockAuth()
 * await login({
 *   email: 'you@example.com',
 *   password: 'secret123',
 *   remember: false,
 * })
 */
export function useMockAuth() {
  /**
   * 本地邮箱登录 mock。
   * 当前只维持与真实接口一致的入参和返回结构，后续可以直接替换为请求实现。
   *
   * @param {LoginPayload} payload 登录表单提交数据。
   * `payload.email` 应传入邮箱字符串，`payload.password` 应传入密码明文，
   * `payload.remember` 表示是否保持登录。
   * @returns {Promise<MockAuthResult>} 成功时返回跳转路径和提示文案。
   * 当邮箱为 `fail@career.local` 或密码长度小于 6 时会抛出错误码。
   *
   * @example
   * await login({
   *   email: 'demo@career.local',
   *   password: 'secret123',
   *   remember: true,
   * })
   */
  async function login(payload: LoginPayload): Promise<MockAuthResult> {
    await wait(980)

    /** 统一把输入邮箱规整成可比对的小写值，避免 mock 条件受大小写影响。 */
    const email = payload.email.trim().toLowerCase()

    if (email === 'fail@career.local') {
      throw new Error('AUTH_INVALID_CREDENTIALS')
    }

    if (payload.password.length < 6) {
      throw new Error('AUTH_PASSWORD_TOO_SHORT')
    }

    return {
      redirectTo: '/dashboard',
      message: 'Mock sign-in successful.',
    }
  }

  /**
   * 本地 Google 登录 mock。
   * 保留独立入口是为了让后续真实 OAuth 接入时不改动页面调用层。
   *
   * @returns {Promise<MockAuthResult>} 成功时返回与真实登录兼容的结果结构。
   *
   * @example
   * const result = await loginWithGoogle()
   * console.info(result.redirectTo)
   */
  async function loginWithGoogle(): Promise<MockAuthResult> {
    await wait(720)

    return {
      redirectTo: '/dashboard',
      message: 'Mock Google sign-in successful.',
    }
  }

  return {
    login,
    loginWithGoogle,
  }
}
