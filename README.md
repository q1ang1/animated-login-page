# animated-login-page

<p>
  <img src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Element_Plus-2-409eff?logo=element&logoColor=white" alt="Element Plus" />
  <img src="https://img.shields.io/badge/UnoCSS-Atomic-333333?logo=unocss&logoColor=white" alt="UnoCSS" />
  <img src="https://img.shields.io/badge/Vitest-Tested-6e9f18?logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm&logoColor=white" alt="pnpm" />
</p>

一个基于 `Vue 3 + Vite + TypeScript` 的登录页模仿实现，目标是尽量贴近 `CareerCompass` 登录页的双栏结构、几何角色互动、主题切换、语言切换和品牌定制体验。

当前仓库是单页前端演示，不包含路由和真实认证后端；它更像一个可继续打磨的 Vue 版还原工程，而不是完整业务系统。

## 项目定位

- 对照来源主要是 `arsh342/careercompass` 的视觉和交互节奏，以及 `a97242689/animated-characters-login-page` 的角色拆分思路。
- 重点不在“重新设计登录页”，而在“把目标页拆成可维护的 Vue 组件、组合函数和配置层”。
- 页面当前保留 mock 登录、品牌配置、主题与语言状态，方便后续继续接真实接口或继续抠动画。

## 你会看到什么

- 左右双栏布局：左侧视觉区展示品牌与几何角色，右侧承载登录表单。
- 四个几何角色的核心交互：待机、鼠标跟随、邮箱聚焦互看、密码隐藏、密码显示和随机眨眼。
- 右上角主题切换与语言切换，且与表单状态、角色状态解耦。
- 品牌可配置：支持替换 logo、品牌名、首页链接和法律链接。
- 本地 mock 登录：方便验证页面状态和交互节奏，不依赖后端。

## 技术栈

- Vue 3
- Vite 5
- TypeScript
- `<script setup lang="tsx">`
- Element Plus
- UnoCSS
- VueUse
- Vitest
- Vue Test Utils
- happy-dom
- pnpm

## 快速开始

```bash
pnpm install
pnpm dev
```

开发服务器默认监听 `0.0.0.0:5173`。

## 可用脚本

```bash
pnpm dev        # 启动开发环境
pnpm typecheck  # 运行 vue-tsc
pnpm test       # 运行 Vitest
pnpm build      # 类型检查 + Vite 构建
pnpm preview    # 本地预览构建产物
pnpm check      # typecheck + test + build
```

## 目录结构

```txt
src/
  assets/                          静态图标与默认品牌资源
  features/login/
    components/                    登录页组件
      characters/Eye.vue           单只眼睛的跟随与闭眼实现
      AuthForm.vue                 表单视图，事件上抛
      BrandLogo.vue                品牌 logo 与 CSS 变量消费层
      CharacterScene.vue           当前实际使用的角色场景实现
      LanguageToggle.vue           语言切换控件
      ThemeToggle.vue              主题切换控件
    composables/
      useLoginI18n.ts              语言解析、文案字典和持久化
      useMockAuth.ts               本地 mock 认证实现
      useSceneMotion.ts            实验版角色动作引擎
      useThemeMode.ts              主题状态与根节点同步
    config/
      brand.ts                     品牌默认配置与 logo CSS 变量生成
    LoginPage.vue                  页面容器，组合状态与子组件
    types.ts                       登录页核心类型定义
  styles/index.css                 全局主题 token 与公共样式
  test/setup.ts                    Vitest 全局清理
  App.vue                          应用根组件
  main.ts                          入口挂载
vite.config.ts                     Vite / Vitest 配置
```

## 核心实现说明

### 页面分层

- `src/App.vue` 只负责挂载登录页并传入品牌配置。
- `src/features/login/LoginPage.vue` 是页面容器，统一持有表单状态、主题状态、语言状态和 mock 登录逻辑。
- `src/features/login/components/AuthForm.vue` 是纯视图组件，只消费 props 并通过事件回传用户输入。
- `src/features/login/components/CharacterScene.vue` 承担当前页面里真实生效的角色动画和表情切换。

### 语言与主题

- 语言入口在 `src/features/login/composables/useLoginI18n.ts`。
- 主题入口在 `src/features/login/composables/useThemeMode.ts` 与 `src/styles/index.css`。
- 语言优先级：`localStorage.lang` > 浏览器首选语言。
- 主题持久化 key：`animated-login-theme`。
- 语言持久化 key：`lang`。
- `ThemeToggle.vue` 使用 Element Plus `ElSwitch`，支持在可用环境下触发 View Transition 切换动画。

### 动画实现

- 当前实际渲染依赖 `CharacterScene.vue` + `characters/Eye.vue`。
- `useSceneMotion.ts` 保留了一套更偏“状态驱动”的实验版动画引擎，目前没有直接挂到页面上，但适合作为后续抽离动画层的参考。
- 角色状态目前覆盖：
  - 默认待机
  - 鼠标移动时眼睛跟随
  - 邮箱输入聚焦时互看
  - 密码隐藏时的防偷看动作
  - 密码显示时的强制视线
  - 随机眨眼

### Mock 认证

- 当前登录不请求真实后端，入口在 `src/features/login/composables/useMockAuth.ts`。
- 规则如下：
  - 成功：任意合法邮箱 + 任意 6 位以上密码
  - 推荐演示：`demo@career.local / compass123`
  - 失败：`fail@career.local / 任意 6 位以上密码`
- 后续如果要接真实接口，优先替换 `useMockAuth.ts`，不用重写页面结构和动画层。

## 品牌定制

品牌入口：

- `src/features/login/config/brand.ts`
- `src/App.vue`

默认 logo 使用 `src/assets/logo-mark.svg`。如果要替换品牌：

1. 把新 logo 放到 `src/assets/`。
2. 在 `brand.ts` 或 `App.vue` 中引入新的 logo 资源。
3. 构造新的 `brand` 对象并传给 `<LoginPage />`。

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

`brand.ts` 会把 logo 的背景、圆角、内边距和尺寸转换成 CSS 变量，最终由 `BrandLogo.vue` 消费。默认链接同时基于 `import.meta.env.BASE_URL` 构造，部署到 GitHub Pages 子路径时不需要再手改品牌首页和法律链接前缀。

## 测试与验证

当前自动化覆盖重点是“组合函数和顶部控件的关键行为”：

- `useLoginI18n.spec.ts`
  - 语言解析优先级
  - `localStorage` 写回
- `ThemeToggle.spec.ts`
  - 主题显式切换事件
- `LanguageToggle.spec.ts`
  - 快速切换与下拉显式选择

运行方式：

```bash
pnpm typecheck
pnpm test
pnpm build
```

## 当前边界

- 仍然是单页模仿实现，未接路由。
- 还没有接真实认证接口或第三方 OAuth。
- 当前只内置英文和简体中文两套文案。
- 动画以关键状态还原为主，还没有做完整逐帧对比。
- `useSceneMotion.ts` 仍处于实验保留状态，当前主流程实际使用的是 `CharacterScene.vue`。

## 后续可继续打磨的方向

- 接入真实邮箱登录和第三方 OAuth
- 增加更多语言包
- 扩展更多主题 token 或品牌皮肤
- 继续细抠四个角色的长时序动画
- 把实验版动作引擎真正抽成可复用的角色场景模块
