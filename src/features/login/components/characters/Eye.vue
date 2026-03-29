<script setup lang="tsx">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { CSSProperties } from 'vue'

/**
 * 单只眼睛组件的输入契约。
 *
 * @example
 * const props: EyeProps = {
 *   size: 18,
 *   pupilSize: 7,
 *   maxDistance: 5,
 *   offsetX: -4,
 *   offsetY: -4,
 *   closed: false,
 *   withSclera: true,
 * }
 */
interface EyeProps {
  /** 外层眼球或单独 pupil 的视觉尺寸，单位为像素。 */
  size: number
  /** 瞳孔尺寸，单位为像素。 */
  pupilSize: number
  /** 鼠标追踪时允许移动的最大距离，单位为像素。 */
  maxDistance?: number
  /** 强制指定瞳孔在 X 轴上的位移；传入后会覆盖鼠标追踪。 */
  offsetX?: number
  /** 强制指定瞳孔在 Y 轴上的位移；传入后会覆盖鼠标追踪。 */
  offsetY?: number
  /** 是否处于闭眼状态。 */
  closed?: boolean
  /** 眼球整体旋转角度。 */
  angle?: number
  /** 是否渲染眼白；橙色和黄色角色应传 `false`。 */
  withSclera?: boolean
  /** 瞳孔颜色。 */
  color?: string
  /** 眼白填充色。 */
  fill?: string
}

/**
 * 当前眼睛实例接收的配置项。
 * 紫色和黑色角色使用带眼白的眼球结构；
 * 橙色和黄色角色则直接使用单独 pupil，避免在平移时被裁成细线。
 * 当 `offsetX` 与 `offsetY` 同时存在时，组件会进入强制朝向模式。
 */
const props = withDefaults(
  defineProps<EyeProps>(),
  {
    maxDistance: 5,
    closed: false,
    angle: 0,
    withSclera: true,
    color: '#2d2d2d',
    fill: '#ffffff',
  },
)

/** 当前眼睛 DOM 节点，用于读取中心点并计算瞳孔跟随位移。 */
const eyeRef = ref<HTMLDivElement | null>(null)

/** 最近一次全局鼠标位置的 X 坐标。 */
const mouseX = ref(0)

/** 最近一次全局鼠标位置的 Y 坐标。 */
const mouseY = ref(0)

/**
 * 缓存全局鼠标位置，供当前眼睛实例计算瞳孔偏移。
 *
 * @param {MouseEvent} event 当前窗口的 mousemove 事件。
 * @returns {void}
 */
function handleMouseMove(event: MouseEvent) {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

/**
 * 当前眼睛实例最终使用的瞳孔偏移量。
 * 规则与原仓库一致：优先使用外部强制方向，否则按鼠标相对位置追踪。
 * 橙色和黄色角色没有眼白，所以它们直接以 pupil 自身中心点计算。
 *
 * @returns {{ x: number, y: number }} 最终渲染到 transform 的位移值。
 *
 * @example
 * trackedOffset.value // { x: -4, y: -4 }
 */
const trackedOffset = computed(() => {
  if (props.offsetX !== undefined && props.offsetY !== undefined) {
    return {
      x: props.offsetX,
      y: props.offsetY,
    }
  }

  if (!eyeRef.value) {
    return { x: 0, y: 0 }
  }

  const rect = eyeRef.value.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const deltaX = mouseX.value - centerX
  const deltaY = mouseY.value - centerY
  const distance = Math.min(
    Math.sqrt(deltaX ** 2 + deltaY ** 2),
    props.maxDistance,
  )
  const angle = Math.atan2(deltaY, deltaX)

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  }
})

/**
 * 带眼白角色的外层容器样式。
 * 紫色和黑色角色会使用该样式来实现眼白、闭眼和旋转。
 */
const wrapperStyle = computed<CSSProperties>(() => ({
  width: `${props.size}px`,
  height: props.closed ? '2px' : `${props.size}px`,
  borderRadius: '50%',
  backgroundColor: props.withSclera ? props.fill : 'transparent',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: `rotate(${props.angle}deg)`,
  transition: 'all 150ms ease',
}))

/** 带眼白角色内部瞳孔的位移样式。 */
const pupilStyle = computed<CSSProperties>(() => ({
  width: `${props.pupilSize}px`,
  height: `${props.pupilSize}px`,
  borderRadius: '50%',
  backgroundColor: props.color,
  transform: `translate(${trackedOffset.value.x}px, ${trackedOffset.value.y}px)`,
  transition: 'transform 0.1s ease-out',
}))

/** 橙色和黄色角色使用独立 pupil，位移时不做裁切。 */
const lonePupilStyle = computed<CSSProperties>(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: '50%',
  backgroundColor: props.color,
  transform: `translate(${trackedOffset.value.x}px, ${trackedOffset.value.y}px)`,
  transition: 'transform 0.1s ease-out',
}))

/**
 * 挂载后开始监听全局鼠标，保证单只眼睛能够独立追踪 pointer。
 * 当前实现延续原项目思路，由每只眼睛自行读取全局鼠标位置。
 */
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

/**
 * 卸载前移除全局鼠标监听，避免角色销毁后仍继续更新位移。
 */
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<template>
  <div v-if="!withSclera" ref="eyeRef" :style="lonePupilStyle" />
  <div v-else ref="eyeRef" :style="wrapperStyle">
    <div v-if="!closed" :style="pupilStyle" />
  </div>
</template>
