# animated-login-page

<p>
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/UnoCSS-Atomic-333333?logo=unocss&logoColor=white" alt="UnoCSS" />
  <img src="https://img.shields.io/badge/Vitest-Tested-6e9f18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/pnpm-Workspace-f69220?logo=pnpm&logoColor=white" alt="pnpm" />
</p>

一个基于 `Vue 3 + Vite + TypeScript + <script setup lang="tsx"> + UnoCSS + pnpm` 的登录页模仿实现。

当前目标不是做一套全新的登录页设计，而是尽量贴近 `CareerCompass` 登录页的视觉结构、角色互动节奏、表单布局、主题切换和语言切换体验，并把代码整理成适合继续打磨的 Vue 版本。

## 对照来源

这份实现主要对照以下两个代码来源和线上效果：

- `arsh342/careercompass`
  作为登录页视觉结构、表单布局、颜色层级和四个几何角色交互逻辑的主要对照来源。
- `a97242689/animated-characters-login-page`
  作为 Vue 方向的角色拆分、组件组织和动画实现参考。

当前仓库是本地模仿实现，不是原仓库的逐文件迁移，也不是对外发布说明页。

## 当前实现

- 还原了左右双栏登录页结构，保持接近目标页的布局比例和视觉层级。
- 还原了四个几何角色的主要状态，包括待机、鼠标跟随、邮箱聚焦、密码隐藏和密码显示。
- 保留了本地 mock 登录入口，方便后续切换真实接口时不改动页面和动画层。
- 加入了品牌配置层，支持传入自定义 logo，并通过 CSS 变量调整背景、圆角、尺寸和留白。
- 补齐了中英文国际化，支持浏览器语言回退、`localStorage.lang` 恢复和右上角手动切换。
- 补齐了 `dark / light` 双主题，并把主题 token 收敛到全局 CSS 变量中。
- 接入了 `Vitest + Vue Test Utils + happy-dom`，用于覆盖核心组合函数和顶部切换控件。
- 对核心类型、组合函数、组件状态和动画逻辑补充了 JSDoc，便于继续维护。

## 技术栈

- Vue 3
- Vite 5
- TypeScript
- `<script setup lang="tsx">`
- UnoCSS
- VueUse
- Vitest
- Vue Test Utils
- pnpm

## 项目结构

```txt
src/
  assets/
    icons/
    logo-mark.svg
  features/login/
    components/
      AuthForm.vue
      BrandLogo.vue
      CharacterScene.vue
      InteractiveButton.vue
      LanguageToggle.vue
      SvgMaskIcon.vue
      ThemeToggle.vue
      characters/
        Eye.vue
    composables/
      useLoginI18n.ts
      useMockAuth.ts
      useSceneMotion.ts
      useThemeMode.ts
    config/
      brand.ts
    LoginPage.vue
    types.ts
  styles/
    index.css
  test/
    setup.ts
  App.vue
  main.ts
```

## 本地运行

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

构建和检查：

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

## 品牌定制

品牌入口：

- `src/features/login/config/brand.ts`
- `src/App.vue`

默认 logo 使用本地资源 `src/assets/logo-mark.svg`。如果要替换成自己的品牌：

1. 把 logo 文件放到 `src/assets/`。
2. 在 `src/features/login/config/brand.ts` 或 `src/App.vue` 中引入新的 logo。
3. 传入新的 `brand` 配置给 `<LoginPage :brand="brand" />`。

示例：

```ts
import customLogo from '@/assets/my-logo.svg'
import LoginPage from '@/features/login/LoginPage.vue'
import { defaultBrandConfig } from '@/features/login/config/brand'

const brand = {
  ...defaultBrandConfig,
  name: 'My Product',
  logo: {
    ...defaultBrandConfig.logo,
    src: customLogo,
    alt: 'My Product logo',
    style: {
      ...defaultBrandConfig.logo.style,
      desktopBackground: 'rgba(255,255,255,0.16)',
      mobileBackground: '#111827',
    },
  },
}
```

logo 的背景、圆角、内边距和尺寸不是写死在页面里的，而是通过品牌配置映射成 CSS 变量，最终由 `BrandLogo.vue` 消费。

## 主题与语言

主题入口：

- `src/features/login/composables/useThemeMode.ts`
- `src/styles/index.css`

语言入口：

- `src/features/login/composables/useLoginI18n.ts`

当前主题能力：

- `dark`
- `light`

当前语言能力：

- `English`
- `简体中文`

语言优先级：

1. 优先读取 `localStorage.lang`
2. 如果没有缓存，再回退浏览器首选语言
3. `zh*` 统一归一到 `zh-CN`
4. 其他语言回退到 `en`

主题切换后会写入：

```txt
animated-login-theme
```

语言切换后会写入：

```txt
lang
```

右上角的主题切换和语言切换与角色动画完全拆开实现，不会把业务状态混进 `CharacterScene.vue`。

## 动画与交互范围

当前重点模仿的状态包括：

- 默认待机状态
- 鼠标移动时四个角色的眼睛跟随
- 邮箱输入框聚焦时的互看状态
- 密码隐藏状态下的角色动作
- 密码显示状态下的强制视线
- 紫色和黑色角色的随机眨眼

实现上把动画状态、表单状态、品牌配置、主题切换和国际化拆成不同层级，后续继续做像素级和时序级打磨时，不需要把所有逻辑堆到一个组件里。

## Mock 登录规则

当前仍然使用本地 mock，不接真实接口。

- 成功账号：任意合法邮箱 + 任意 6 位以上密码
- 推荐演示：`demo@career.local / compass123`
- 失败账号：`fail@career.local / 任意 6 位以上密码`

后续如果要接真实接口，只需要替换：

- `src/features/login/composables/useMockAuth.ts`

页面结构、表单交互和角色动画不需要整体重写。

## 当前验证

已完成：

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- 浏览器内验证主题切换、语言切换和顶部控件尺寸稳定性
- 浏览器内验证主要角色状态和关键交互

## 当前边界

- 还没有接真实认证接口。
- 目前只覆盖中英文，不包含更多语种。
- 动画对齐当前以关键帧对照为主，还没有做完整长时序逐帧 diff。

## 后续可继续打磨的方向

- 接入真实邮箱登录和第三方 OAuth
- 增加更多语言包
- 增加更多主题 token 或品牌皮肤
- 继续细抠四个角色的长时序动画
- 把角色场景抽成独立可复用模块
