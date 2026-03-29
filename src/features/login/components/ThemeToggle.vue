<script setup lang="tsx">
import { MoonNight, Sunny } from '@element-plus/icons-vue'
import type { SwitchInstance } from 'element-plus'
import { ElSwitch } from 'element-plus'
import { nextTick, ref, watch } from 'vue'
import type { ThemeMode } from '@/features/login/types'

defineOptions({ inheritAttrs: false })

/**
 * 主题切换器的输入契约。
 *
 * @example
 * const props: ThemeToggleProps = {
 *   theme: 'dark',
 *   nextThemeLabel: 'Switch to light theme',
 * }
 */
interface ThemeToggleProps {
  /** 当前主题模式。 */
  theme: ThemeMode
  /** 当前按钮的可访问提示文案。 */
  nextThemeLabel: string
}

/** 当前主题切换器接收的外部状态。 */
const props = defineProps<ThemeToggleProps>()

/**
 * 主题切换器只把用户最终选择的新主题回传给父层。
 * 真正的主题状态仍由父层统一持有，避免局部状态和全局 CSS 变量脱节。
 */
const emit = defineEmits<{
  'update:theme': [theme: ThemeMode]
}>()

/**
 * `ElSwitch` 实例引用。
 * Element Plus 官网主题切换会从开关中心点触发揭幕动画，这里需要读取它的几何信息。
 */
const switchRef = ref<SwitchInstance>()

/**
 * 组件内部维护的布尔型主题状态。
 * 官方 `el-switch` 推荐直接用 `v-model` 驱动，所以这里用布尔值映射 `dark / light`。
 */
const darkMode = ref(props.theme === 'dark')

/**
 * 当父层主题因为初始化、本地缓存或其他外部动作发生变化时，
 * 同步修正当前开关的内部布尔值。
 *
 * @param {ThemeMode} nextTheme 父层传入的最新主题值。
 * @returns {void}
 *
 * @example
 * // 父层把主题切到 light 后，开关同步到关闭状态
 * // watch 内部会把 darkMode.value 设为 false
 */
watch(
  () => props.theme,
  (nextTheme) => {
    const nextValue = nextTheme === 'dark'

    if (darkMode.value !== nextValue) {
      darkMode.value = nextValue
    }
  },
)

/**
 * 监听 `v-model` 的结果值，并在用户真实完成切换后把新主题抛给父层。
 * 这里显式比对 `props.theme`，避免父层回写时重复触发事件。
 *
 * @param {boolean} nextValue `el-switch` 当前的布尔型状态。
 * `true` 表示深色，`false` 表示浅色。
 * @returns {void}
 *
 * @example
 * // 用户把开关拨到右侧
 * // darkMode.value 会变成 true，并向父层 emit('update:theme', 'dark')
 */
watch(darkMode, (nextValue) => {
  const nextTheme = nextValue ? 'dark' : 'light'

  if (nextTheme !== props.theme) {
    emit('update:theme', nextTheme)
  }
})

/**
 * 读取当前开关在视口中的中心点。
 * 如果节点还没挂载完成，则返回 `undefined`，后续动画会自动降级为普通切换。
 *
 * @returns {{ x: number; y: number } | undefined} 当前切换动画可用的圆心坐标。
 *
 * @example
 * const origin = getThemeSwitchOrigin()
 * console.log(origin?.x, origin?.y)
 */
function getThemeSwitchOrigin() {
  const switchElement = switchRef.value?.$el as HTMLElement | undefined

  if (!switchElement) {
    return undefined
  }

  const rect = switchElement.getBoundingClientRect()

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  }
}

/**
 * 在真正切换主题前执行 Element Plus 官网同款的 View Transition 揭幕动画。
 * 这是 `el-switch` 文档里 `before-change` 的典型用法：
 * 通过返回 `Promise<boolean>` 延后状态切换，等截图和动画准备完后再放行。
 *
 * @returns {Promise<boolean>} `true` 表示允许本次开关切换继续执行。
 *
 * @example
 * <ElSwitch :before-change="beforeChange" />
 */
function beforeChange() {
  return new Promise<boolean>((resolve) => {
    const origin = getThemeSwitchOrigin()
    const supportsViewTransition =
      Boolean(origin) &&
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!supportsViewTransition || !origin) {
      resolve(true)
      return
    }

    const nextTheme = darkMode.value ? 'light' : 'dark'
    const endRadius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    )
    const ratioX = (100 * origin.x) / window.innerWidth
    const ratioY = (100 * origin.y) / window.innerHeight
    const referenceRadius = Math.hypot(window.innerWidth, window.innerHeight) / Math.SQRT2
    const ratioRadius = (100 * endRadius) / referenceRadius

    const clipPath = [
      `circle(0% at ${ratioX}% ${ratioY}%)`,
      `circle(${ratioRadius}% at ${ratioX}% ${ratioY}%)`,
    ]

    const transitionDocument = document as Document & {
      startViewTransition?: (callback: () => Promise<void> | void) => {
        ready: Promise<void>
      }
    }

    if (!transitionDocument.startViewTransition) {
      resolve(true)
      return
    }

    const transition = transitionDocument.startViewTransition(async () => {
      resolve(true)
      await nextTick()
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: nextTheme === 'dark' ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 400,
          easing: 'ease-in',
          fill: 'both',
          pseudoElement:
            nextTheme === 'dark'
              ? '::view-transition-old(root)'
              : '::view-transition-new(root)',
        },
      )
    })
  })
}
</script>

<template>
  <ElSwitch
    ref="switchRef"
    v-model="darkMode"
    class="theme-site-switch"
    :aria-label="props.nextThemeLabel"
    size="large"
    :before-change="beforeChange"
    :active-action-icon="MoonNight"
    :inactive-action-icon="Sunny"
  />
</template>

<style scoped>
.theme-site-switch {
  display: inline-flex;
  flex-shrink: 0;
  transition: transform 180ms ease;
}

.theme-site-switch:deep(.el-switch__core) {
  --el-switch-on-color: var(--theme-toggle-background);
  --el-switch-off-color: var(--theme-toggle-background);
  --el-switch-border-color: var(--theme-toggle-border);
  border-radius: 999px;
}

.theme-site-switch:deep(.el-switch__action .el-icon) {
  font-size: 0.95rem;
}

.theme-site-switch:deep(.el-switch__action svg) {
  width: 0.95rem;
  height: 0.95rem;
}

.theme-site-switch:deep(.el-switch__action) {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 3px 10px rgba(15, 23, 42, 0.16);
}

.theme-site-switch:deep(.el-switch__action .el-icon) {
  color: #d97706;
}

:global(.theme-site-switch.is-checked .el-switch__action) {
  background: #111827;
  border-color: rgba(255, 255, 255, 0.12);
}

:global(.theme-site-switch.is-checked .el-switch__action .el-icon) {
  color: #f8fafc;
}

@media (hover: hover) and (pointer: fine) {
  .theme-site-switch:hover {
    transform: translateY(-1px);
  }
}
</style>
