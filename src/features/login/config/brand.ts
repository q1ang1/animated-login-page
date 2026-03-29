/**
 * 登录页品牌配置入口。
 * 负责输出默认品牌数据，并把 logo 的尺寸与容器样式映射成组件可消费的 CSS 变量。
 * 所有默认链接都会基于 `import.meta.env.BASE_URL` 生成，便于部署到 GitHub Pages 子路径。
 */
import logoMark from '@/assets/logo-mark.svg'
import type { BrandConfig, BrandLogoConfig } from '@/features/login/types'

/**
 * 当前应用部署基路径。
 * 开发环境通常是 `/`，GitHub Pages 项目页下会自动变成 `/<repo>/`。
 */
const appBasePath = import.meta.env.BASE_URL

/**
 * 把品牌 logo 配置转换成组件可直接消费的 CSS 变量。
 * 变量名已经和 `BrandLogo.vue` 对齐，后续只需要改这里或改品牌配置即可。
 *
 * @param {BrandLogoConfig} logo 当前品牌 logo 配置。
 * @param {'desktop' | 'mobile'} variant 当前需要生成桌面端还是移动端变量。
 * @returns {Record<string, string>} 可直接绑定到 `:style` 的 CSS 变量对象。
 *
 * @example
 * const vars = createBrandLogoVariables(defaultBrandConfig.logo, 'desktop')
 */
export function createBrandLogoVariables(
  logo: BrandLogoConfig,
  variant: 'desktop' | 'mobile',
) {
  const isMobile = variant === 'mobile'

  return {
    '--brand-logo-width': `${logo.width}px`,
    '--brand-logo-height': `${logo.height}px`,
    '--brand-logo-background': isMobile
      ? logo.style.mobileBackground
      : logo.style.desktopBackground,
    '--brand-logo-padding': isMobile
      ? logo.style.mobilePadding
      : logo.style.desktopPadding,
    '--brand-logo-radius': isMobile
      ? logo.style.mobileRadius
      : logo.style.desktopRadius,
  }
}

/**
 * 默认品牌配置。
 *
 * 自定义 logo 的推荐方式：
 * 1. 把 logo 文件放到 `src/assets/`。
 * 2. 在当前文件顶部使用 `import customLogo from '@/assets/your-logo.svg'` 引入。
 * 3. 在 `App.vue` 中把 `defaultBrandConfig` 换成你自己的 `brand` 对象并传给 `LoginPage`。
 *
 * @example
 * import customLogo from '@/assets/my-logo.svg'
 *
 * const brand: BrandConfig = {
 *   ...defaultBrandConfig,
 *   name: 'My Product',
 *   logo: {
 *     ...defaultBrandConfig.logo,
 *     src: customLogo,
 *     alt: 'My Product logo',
 *     style: {
 *       ...defaultBrandConfig.logo.style,
 *       desktopBackground: 'rgba(255,255,255,0.16)',
 *       mobileBackground: '#111827',
 *     },
 *   },
 * }
 */
export const defaultBrandConfig: BrandConfig = {
  name: 'CareerCompass',
  homeHref: appBasePath,
  logo: {
    src: logoMark,
    alt: 'CareerCompass logo',
    width: 32,
    height: 32,
    style: {
      desktopBackground: 'rgba(255,255,255,0.1)',
      desktopPadding: '0.25rem',
      desktopRadius: '0.75rem',
      mobileBackground: '#ffffff',
      mobilePadding: '0.25rem',
      mobileRadius: '0.5rem',
    },
  },
  links: {
    // 当前仍是单页模仿版，未接路由前先保留在当前页的 hash 目标，避免 Pages 上跳到不存在的路径。
    privacyPolicy: `${appBasePath}#privacy-policy`,
    termsOfService: `${appBasePath}#terms-of-service`,
    forgotPassword: `${appBasePath}#forgot-password`,
    signUp: `${appBasePath}#sign-up`,
  },
}
