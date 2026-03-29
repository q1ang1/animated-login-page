/**
 * 登录页当前聚焦到的字段类型。
 * 该值只服务于四个角色的联动，不直接参与登录提交。
 *
 * @example
 * const focusField: FocusField = 'email'
 */
export type FocusField = 'idle' | 'email' | 'password'

/**
 * 登录请求的粗粒度执行状态。
 * 后续接真实接口时，可以继续沿用这组枚举驱动按钮和提示。
 *
 * @example
 * const status: AuthStatus = 'loading'
 */
export type AuthStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 登录表单的最小业务模型。
 *
 * @example
 * const form: LoginFormModel = {
 *   email: 'you@example.com',
 *   password: 'secret123',
 *   remember: true,
 * }
 */
export interface LoginFormModel {
  /** 用户输入的邮箱地址，提交前会做基础格式校验。 */
  email: string
  /** 用户输入的密码明文，仅用于本地表单和后续接口提交。 */
  password: string
  /** 是否勾选“Remember for 30 days”。 */
  remember: boolean
}

/**
 * 表单字段级错误信息。
 * 字段名与界面输入框一一对应，便于直接渲染在输入框下方。
 *
 * @example
 * const errors: LoginFieldErrors = {
 *   email: 'Please enter a valid email address.',
 *   password: '',
 * }
 */
export interface LoginFieldErrors {
  /** 邮箱输入框对应的错误文案；空字符串表示当前无错误。 */
  email: string
  /** 密码输入框对应的错误文案；空字符串表示当前无错误。 */
  password: string
}

/**
 * 角色动画真正依赖的页面状态快照。
 * 该结构目前主要给实验用动画引擎保留，不直接参与当前页面渲染。
 *
 * @example
 * const snapshot: SceneSnapshot = {
 *   focusField: 'password',
 *   passwordVisible: false,
 *   passwordLength: 8,
 *   authStatus: 'idle',
 * }
 */
export interface SceneSnapshot {
  /** 当前聚焦字段，用于决定角色是在空闲、看邮箱还是看密码。 */
  focusField: FocusField
  /** 密码是否处于明文可见状态。 */
  passwordVisible: boolean
  /** 当前密码长度，用于判断是否进入偷看或遮挡动作。 */
  passwordLength: number
  /** 认证执行状态，用于扩展提交、成功或失败动画。 */
  authStatus: AuthStatus
}

/**
 * 单只眼睛在当前帧的动作数据。
 *
 * @example
 * const eye: EyeMotion = { x: -4, y: -4, closed: false }
 */
export interface EyeMotion {
  /** 瞳孔在 X 轴的平移像素值。 */
  x: number
  /** 瞳孔在 Y 轴的平移像素值。 */
  y: number
  /** 当前帧是否闭眼。 */
  closed: boolean
}

/**
 * 嘴部线条在当前帧的形态参数。
 *
 * @example
 * const mouth: MouthMotion = {
 *   width: 54,
 *   curve: 0,
 *   openness: 0,
 *   shiftX: 0,
 *   shiftY: 0,
 * }
 */
export interface MouthMotion {
  /** 嘴部宽度，单位为像素。 */
  width: number
  /** 嘴角弧度；正值更偏笑，负值更偏难过。 */
  curve: number
  /** 嘴部开口程度。 */
  openness: number
  /** 嘴部整体在 X 轴上的偏移量。 */
  shiftX: number
  /** 嘴部整体在 Y 轴上的偏移量。 */
  shiftY: number
}

/**
 * 单个角色在当前帧的完整动作信息。
 *
 * @example
 * const purple: CharacterMotion = {
 *   shiftX: 0,
 *   shiftY: -6,
 *   skew: -8,
 *   stretch: 1.08,
 *   leftEye: { x: -4, y: -4, closed: false },
 *   rightEye: { x: -4, y: -4, closed: false },
 *   mouth: { width: 0, curve: 0, openness: 0, shiftX: 0, shiftY: 0 },
 * }
 */
export interface CharacterMotion {
  /** 角色整体在 X 轴上的额外位移。 */
  shiftX: number
  /** 角色整体在 Y 轴上的额外位移。 */
  shiftY: number
  /** 角色主体的倾斜角度。 */
  skew: number
  /** 角色主体的拉伸倍率。 */
  stretch: number
  /** 左眼当前帧动作。 */
  leftEye: EyeMotion
  /** 右眼当前帧动作。 */
  rightEye: EyeMotion
  /** 嘴部当前帧动作。 */
  mouth: MouthMotion
}

/**
 * 四个角色共同组成的场景动画状态。
 *
 * @example
 * const sceneMotion: SceneMotion = {
 *   purple,
 *   black,
 *   orange,
 *   yellow,
 * }
 */
export interface SceneMotion {
  /** 紫色高矩形角色的动作状态。 */
  purple: CharacterMotion
  /** 黑色高矩形角色的动作状态。 */
  black: CharacterMotion
  /** 橙色半圆角色的动作状态。 */
  orange: CharacterMotion
  /** 黄色圆角矩形角色的动作状态。 */
  yellow: CharacterMotion
}

/**
 * 登录接口请求入参。
 * 目前由本地 mock 使用，后续切换真实接口时无需改动调用方结构。
 *
 * @example
 * const payload: LoginPayload = {
 *   email: 'you@example.com',
 *   password: 'secret123',
 *   remember: false,
 * }
 */
export interface LoginPayload {
  /** 登录邮箱。 */
  email: string
  /** 登录密码。 */
  password: string
  /** 是否记住登录状态。 */
  remember: boolean
}

/**
 * mock 认证返回结果。
 *
 * @example
 * const result: MockAuthResult = {
 *   redirectTo: '/dashboard',
 *   message: 'Mock sign-in successful.',
 * }
 */
export interface MockAuthResult {
  /** 成功后理论上的跳转目标路径。 */
  redirectTo: string
  /** 当前登录结果提示文案。 */
  message: string
}

/**
 * 支持的登录页语言。
 * 当前只覆盖中文和英文两种界面文案。
 *
 * @example
 * const locale: AppLocale = 'zh-CN'
 */
export type AppLocale = 'en' | 'zh-CN'

/**
 * 支持的外观主题。
 * `dark` 是当前默认视觉，`light` 是新增的浅色变体。
 *
 * @example
 * const theme: ThemeMode = 'dark'
 */
export type ThemeMode = 'dark' | 'light'

/**
 * 主题切换动画的触发原点。
 * 通常取自主题开关在视口中的中心点，用于计算揭幕动画的圆心。
 *
 * @example
 * const origin: ThemeTransitionOrigin = { x: 1440, y: 36 }
 */
export interface ThemeTransitionOrigin {
  /** 动画圆心在视口中的 X 坐标。 */
  x: number
  /** 动画圆心在视口中的 Y 坐标。 */
  y: number
}

/**
 * 品牌 logo 在桌面端和移动端共用的样式变量配置。
 * 最终会被转换成 CSS 变量，挂到品牌 logo 组件上。
 *
 * @example
 * const logoStyle: BrandLogoStyle = {
 *   desktopBackground: 'rgba(255,255,255,0.1)',
 *   desktopPadding: '0.25rem',
 *   desktopRadius: '0.75rem',
 *   mobileBackground: '#ffffff',
 *   mobilePadding: '0.25rem',
 *   mobileRadius: '0.5rem',
 * }
 */
export interface BrandLogoStyle {
  /** 桌面端 logo 外层背景色。 */
  desktopBackground: string
  /** 桌面端 logo 外层内边距。 */
  desktopPadding: string
  /** 桌面端 logo 外层圆角。 */
  desktopRadius: string
  /** 移动端 logo 外层背景色。 */
  mobileBackground: string
  /** 移动端 logo 外层内边距。 */
  mobilePadding: string
  /** 移动端 logo 外层圆角。 */
  mobileRadius: string
}

/**
 * 品牌 logo 的资源和尺寸配置。
 *
 * @example
 * const logo: BrandLogoConfig = {
 *   src: '/logo.svg',
 *   alt: 'CareerCompass logo',
 *   width: 32,
 *   height: 32,
 *   style: logoStyle,
 * }
 */
export interface BrandLogoConfig {
  /** logo 图片地址，可以是本地静态资源 import，也可以是外链 URL。 */
  src: string
  /** logo 图片的替代文本。 */
  alt: string
  /** logo 视觉宽度，单位为像素。 */
  width: number
  /** logo 视觉高度，单位为像素。 */
  height: number
  /** logo 外层样式变量。 */
  style: BrandLogoStyle
}

/**
 * 登录页品牌配置。
 * 目前包含品牌名、主页链接、logo 资源以及法律链接地址。
 *
 * @example
 * const brand: BrandConfig = {
 *   name: 'CareerCompass',
 *   homeHref: '/',
 *   logo,
 *   links: {
 *     privacyPolicy: '/privacy-policy',
 *     termsOfService: '/terms',
 *     forgotPassword: '/forgot-password',
 *     signUp: '/signup',
 *   },
 * }
 */
export interface BrandConfig {
  /** 品牌展示名。 */
  name: string
  /** 点击品牌区后跳转的首页地址。 */
  homeHref: string
  /** 当前品牌 logo 配置。 */
  logo: BrandLogoConfig
  /** 登录页涉及的品牌链接集合。 */
  links: {
    /** 隐私政策链接。 */
    privacyPolicy: string
    /** 服务条款链接。 */
    termsOfService: string
    /** 忘记密码链接。 */
    forgotPassword: string
    /** 注册页链接。 */
    signUp: string
  }
}

/**
 * 登录页全部界面文案。
 * 页面和表单组件都通过这组字段读取对应语言的文本。
 *
 * @example
 * const copy: LoginCopy = {
 *   pageTitle: 'Welcome back',
 *   pageDescription: 'Please enter your details',
 *   languageLabel: 'Language',
 *   languageEnglish: 'EN',
 *   languageChinese: '中文',
 *   switchToEnglish: 'Switch to English',
 *   switchToChinese: '切换到中文',
 *   themeLabel: 'Theme',
 *   themeDark: 'Dark',
 *   themeLight: 'Light',
 *   switchToDarkTheme: 'Switch to light theme',
 *   switchToLightTheme: 'Switch to dark theme',
 *   emailLabel: 'Email',
 *   emailPlaceholder: 'you@example.com',
 *   passwordLabel: 'Password',
 *   passwordPlaceholder: '••••••••',
 *   showPassword: 'Show password',
 *   hidePassword: 'Hide password',
 *   rememberFor30Days: 'Remember for 30 days',
 *   forgotPassword: 'Forgot password?',
 *   logIn: 'Log in',
 *   signingIn: 'Signing in...',
 *   logInWithGoogle: 'Log in with Google',
 *   noAccount: \"Don't have an account?\",
 *   signUp: 'Sign Up',
 *   privacyPolicy: 'Privacy Policy',
 *   termsOfService: 'Terms of Service',
 *   invalidEmail: 'Please enter a valid email address.',
 *   passwordTooShort: 'Password must be at least 6 characters.',
 *   loginFailed: 'Invalid email or password. Please try again.',
 *   googleLoginFailed: 'Google Sign-In Failed',
 * }
 */
export interface LoginCopy {
  /** 浏览器标签页标题文案。 */
  pageTitle: string
  /** 登录页主标题。 */
  welcomeTitle: string
  /** 登录页副标题。 */
  pageDescription: string
  /** 语言切换器标题。 */
  languageLabel: string
  /** 英文语言简称。 */
  languageEnglish: string
  /** 中文语言简称。 */
  languageChinese: string
  /** 当前为中文时，切换按钮的可访问提示。 */
  switchToEnglish: string
  /** 当前为英文时，切换按钮的可访问提示。 */
  switchToChinese: string
  /** 主题切换器标题。 */
  themeLabel: string
  /** 深色主题名称。 */
  themeDark: string
  /** 浅色主题名称。 */
  themeLight: string
  /** 当前为浅色时，切换按钮的可访问提示。 */
  switchToDarkTheme: string
  /** 当前为深色时，切换按钮的可访问提示。 */
  switchToLightTheme: string
  /** 邮箱字段标签。 */
  emailLabel: string
  /** 邮箱输入框占位符。 */
  emailPlaceholder: string
  /** 密码字段标签。 */
  passwordLabel: string
  /** 密码输入框占位符。 */
  passwordPlaceholder: string
  /** 显示密码按钮的可访问文案。 */
  showPassword: string
  /** 隐藏密码按钮的可访问文案。 */
  hidePassword: string
  /** “记住 30 天”文案。 */
  rememberFor30Days: string
  /** 忘记密码文案。 */
  forgotPassword: string
  /** 主登录按钮文案。 */
  logIn: string
  /** 提交中的按钮文案。 */
  signingIn: string
  /** Google 登录按钮文案。 */
  logInWithGoogle: string
  /** 注册引导前缀。 */
  noAccount: string
  /** 注册按钮文案。 */
  signUp: string
  /** 隐私政策文案。 */
  privacyPolicy: string
  /** 服务条款文案。 */
  termsOfService: string
  /** 邮箱格式错误文案。 */
  invalidEmail: string
  /** 密码长度错误文案。 */
  passwordTooShort: string
  /** 通用登录失败文案。 */
  loginFailed: string
  /** Google 登录失败文案。 */
  googleLoginFailed: string
}
