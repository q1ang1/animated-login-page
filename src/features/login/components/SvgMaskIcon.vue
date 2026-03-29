<script setup lang="tsx">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'

/**
 * 基于静态 SVG 文件生成单色图标遮罩。
 * 组件本身不关心业务语义，只负责让导入的图标资源继承父级 `currentColor`。
 *
 * @example
 * <SvgMaskIcon :icon="arrowRightIcon" size="1rem" />
 */
interface SvgMaskIconProps {
  /** 通过 `import xxx from '*.svg'` 导入后的图标资源 URL。 */
  icon: string
  /** 图标尺寸，支持 `px`、`rem` 等任意合法 CSS 长度。 */
  size?: string
}

/** 当前遮罩图标接收的配置。 */
const props = withDefaults(
  defineProps<SvgMaskIconProps>(),
  {
    size: '1rem',
  },
)

/**
 * 把图标资源和尺寸转换成根节点样式。
 *
 * @returns {CSSProperties} 当前图标根节点需要挂载的行内样式。
 *
 * @example
 * iconStyle.value
 */
const iconStyle = computed<CSSProperties>(() => ({
  '--mask-icon': `url("${props.icon}")`,
  width: props.size,
  height: props.size,
}))
</script>

<template>
  <span aria-hidden="true" class="svg-mask-icon" :style="iconStyle" />
</template>

<style scoped>
.svg-mask-icon {
  display: inline-block;
  flex: none;
  background-color: currentColor;
  -webkit-mask-image: var(--mask-icon);
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  mask-image: var(--mask-icon);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
}
</style>
