<script setup lang="tsx">
import arrowRightIcon from '@/assets/icons/arrow-right.svg'
import SvgMaskIcon from '@/features/login/components/SvgMaskIcon.vue'

/**
 * 交互按钮组件的 props 契约。
 *
 * @example
 * const props: InteractiveButtonProps = {
 *   text: 'Log in',
 *   type: 'submit',
 *   disabled: false,
 *   className: 'h-12 w-full',
 * }
 */
interface InteractiveButtonProps {
  /** 按钮主文案，未传时默认为 `Button`。 */
  text?: string
  /** 原生按钮类型，当前只开放 `button` 和 `submit`。 */
  type?: 'button' | 'submit'
  /** 是否禁用按钮交互。 */
  disabled?: boolean
  /** 透传到按钮根节点的额外 UnoCSS 类名。 */
  className?: string
}

/**
 * 当前按钮接收的配置项。
 * `className` 只做样式扩展，不建议在外部覆写核心交互结构。
 */
const props = withDefaults(
  defineProps<InteractiveButtonProps>(),
  {
    text: 'Button',
    type: 'button',
    disabled: false,
    className: '',
  },
)

/**
 * 按钮对外暴露的事件契约。
 * 当前只向父层回传 `click`，业务状态仍由父组件控制。
 */
const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    :type="props.type"
    :disabled="props.disabled"
    :class="[
      'auth-interactive-button group relative cursor-pointer overflow-hidden rounded-full border border-solid bg-[var(--background)] px-6 py-2 text-center text-[var(--foreground)]',
      props.className,
    ]"
    @click="emit('click')"
  >
    <span
      class="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0"
    >
      {{ props.text }}
    </span>

    <div
      class="absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] opacity-0 transition-all duration-300 group-hover:opacity-100"
    >
      <span>{{ props.text }}</span>

      <slot name="icon">
        <SvgMaskIcon :icon="arrowRightIcon" size="1rem" />
      </slot>
    </div>
  </button>
</template>
