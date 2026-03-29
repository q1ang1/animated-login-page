import {
  useDocumentVisibility,
  useElementBounding,
  usePointer,
  usePreferredReducedMotion,
  useRafFn,
} from '@vueuse/core'
import { computed, onBeforeUnmount, shallowRef, watch, type Ref } from 'vue'
import type {
  CharacterMotion,
  EyeMotion,
  MouthMotion,
  SceneMotion,
  SceneSnapshot,
} from '@/features/login/types'

/**
 * 二维平面坐标。
 *
 * @example
 * const center: Point = { x: 280, y: 192 }
 */
interface Point {
  /** 水平坐标，单位为像素。 */
  x: number
  /** 垂直坐标，单位为像素。 */
  y: number
}

/**
 * 预置嘴型集合，用于不同场景间快速切换。
 *
 * @example
 * BASE_PALETTE.smileMouth
 */
const BASE_PALETTE = {
  idleMouth: { width: 0, curve: 0, openness: 0, shiftX: 0, shiftY: 0 },
  flatMouth: { width: 54, curve: 0, openness: 0, shiftX: 0, shiftY: 0 },
  smileMouth: { width: 34, curve: 12, openness: 7, shiftX: 0, shiftY: -2 },
  sadMouth: { width: 28, curve: -8, openness: 2, shiftX: 0, shiftY: 1 },
} satisfies Record<string, MouthMotion>

/**
 * 把数值稳定在目标区间内，避免角色位移过冲。
 *
 * @param {number} value 需要限制的原始数值。
 * @param {number} min 允许的最小值。
 * @param {number} max 允许的最大值。
 * @returns {number} 被限制到目标区间内的结果。
 *
 * @example
 * clamp(12, -8, 8) // 8
 */
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * 帧间插值，降低鼠标移动带来的抖动。
 *
 * @param {number} source 当前帧数值。
 * @param {number} target 目标帧数值。
 * @param {number} amount 插值系数，通常在 `0` 到 `1` 之间。
 * @returns {number} 当前帧应逼近的中间值。
 *
 * @example
 * lerp(0, 10, 0.2) // 2
 */
function lerp(source: number, target: number, amount: number) {
  return source + (target - source) * amount
}

/**
 * 构造单只眼睛的运动状态。
 *
 * @param {number} [x=0] 眼睛在 X 轴上的位移。
 * @param {number} [y=0] 眼睛在 Y 轴上的位移。
 * @param {boolean} [closed=false] 当前是否闭眼。
 * @returns {EyeMotion} 单只眼睛的完整动作数据。
 *
 * @example
 * makeEye(-4, -4, false)
 */
function makeEye(x = 0, y = 0, closed = false): EyeMotion {
  return { x, y, closed }
}

/**
 * 创建单个角色的默认动作。
 *
 * @returns {CharacterMotion} 初始静止态的角色动作。
 *
 * @example
 * const purple = makeCharacter()
 */
function makeCharacter(): CharacterMotion {
  return {
    shiftX: 0,
    shiftY: 0,
    skew: 0,
    stretch: 1,
    leftEye: makeEye(),
    rightEye: makeEye(),
    mouth: { ...BASE_PALETTE.idleMouth },
  }
}

/**
 * 创建完整场景的初始动画状态。
 *
 * @returns {SceneMotion} 四个角色的默认场景动作。
 *
 * @example
 * const motion = createMotion()
 */
function createMotion(): SceneMotion {
  return {
    purple: makeCharacter(),
    black: makeCharacter(),
    orange: makeCharacter(),
    yellow: {
      ...makeCharacter(),
      mouth: { ...BASE_PALETTE.flatMouth },
    },
  }
}

/**
 * 为需要眨眼的角色维护独立 blink 状态。
 *
 * @returns {{
 *   purple: import('vue').ShallowRef<boolean>,
 *   black: import('vue').ShallowRef<boolean>,
 *   orange: import('vue').ShallowRef<boolean>,
 *   yellow: import('vue').ShallowRef<boolean>
 * }} 四个角色各自的闭眼状态。
 *
 * @example
 * const blink = createBlinkTracker()
 */
function createBlinkTracker() {
  return {
    purple: shallowRef(false),
    black: shallowRef(false),
    orange: shallowRef(false),
    yellow: shallowRef(false),
  }
}

/**
 * 基于场景快照、pointer 和 RAF 生成角色动作。
 * 当前文件主要作为动画策略实验稿保留，后续如重新启用可直接接回登录页。
 *
 * @param {Ref<SceneSnapshot>} scene 由页面层维护的场景快照。
 * `focusField`、`passwordVisible`、`passwordLength` 和 `authStatus`
 * 都会在这里被转换为角色动作。
 * @returns {{
 *   stageRef: import('vue').ShallowRef<HTMLElement | null>,
 *   motion: import('vue').ShallowRef<SceneMotion>,
 *   reducedMotion: import('vue').ComputedRef<'reduce' | 'no-preference' | undefined>
 * }} 场景 DOM 引用、当前动作状态以及系统动效偏好。
 *
 * @example
 * const { stageRef, motion } = useSceneMotion(scene)
 */
export function useSceneMotion(scene: Ref<SceneSnapshot>) {
  /** 场景舞台根节点，供边界计算和 pointer 局部化使用。 */
  const stageRef = shallowRef<HTMLElement | null>(null)

  /** 当前帧四个角色的动作快照。 */
  const motion = shallowRef<SceneMotion>(createMotion())

  /** 系统是否要求减少动画。 */
  const reducedMotion = usePreferredReducedMotion()

  /** 页面可见性状态；切到后台时会暂停 RAF。 */
  const documentVisibility = useDocumentVisibility()

  /** 全局 pointer 坐标。 */
  const pointer = usePointer()

  /** 当前场景舞台的边界矩形。 */
  const bounds = useElementBounding(stageRef)

  /** 经过平滑插值后的局部 pointer，用于减少抖动。 */
  const smoothed = shallowRef<Point>({ x: 0, y: 0 })

  /** 四个角色各自的 blink 状态容器。 */
  const blink = createBlinkTracker()

  /** 所有递归 blink timer 的句柄集合，便于统一清理。 */
  const blinkTimers: number[] = []

  /**
   * 把全局 pointer 转换成当前舞台内部坐标。
   *
   * @returns {Point} 当前舞台坐标系内的 pointer 位置。
   *
   * @example
   * localPointer.value
   */
  const localPointer = computed<Point>(() => {
    const width = bounds.width.value || 560
    const height = bounds.height.value || 384
    const x = clamp(pointer.x.value - bounds.left.value, 0, width)
    const y = clamp(pointer.y.value - bounds.top.value, 0, height)

    return { x, y }
  })

  /**
   * 为指定角色安排下一次随机眨眼。
   *
   * @param {'purple' | 'black' | 'orange' | 'yellow'} key 目标角色标识。
   * @returns {void}
   *
   * @example
   * scheduleBlink('purple')
   */
  function scheduleBlink(key: keyof typeof blink) {
    const timeout = window.setTimeout(
      () => {
        blink[key].value = true
        const restore = window.setTimeout(() => {
          blink[key].value = false
          scheduleBlink(key)
        }, 140)
        blinkTimers.push(restore)
      },
      Math.round(Math.random() * 3200 + 1800),
    )

    blinkTimers.push(timeout)
  }

  /**
   * 页面卸载或逻辑切换时统一清空所有 blink timer。
   *
   * @returns {void}
   *
   * @example
   * resetBlinking()
   */
  function resetBlinking() {
    blinkTimers.splice(0).forEach((timer) => window.clearTimeout(timer))
  }

  const { pause, resume } = useRafFn(() => {
    if (!stageRef.value) return

    if (documentVisibility.value === 'hidden') return

    const width = bounds.width.value || 560
    const height = bounds.height.value || 384
    const target = localPointer.value
    const factor = reducedMotion.value === 'reduce' ? 0.18 : 0.11

    smoothed.value = {
      x: lerp(smoothed.value.x || width / 2, target.x, factor),
      y: lerp(smoothed.value.y || height / 2, target.y, factor),
    }

    const sceneState = scene.value

    const purpleCenter = { x: width * 0.34, y: height * 0.25 }
    const blackCenter = { x: width * 0.54, y: height * 0.38 }
    const orangeCenter = { x: width * 0.21, y: height * 0.72 }
    const yellowCenter = { x: width * 0.73, y: height * 0.56 }

    const track = (
      center: Point,
      rangeX: number,
      rangeY: number,
      shiftY = 0,
    ) => {
      const dx = clamp((smoothed.value.x - center.x) / (width * 0.24), -1, 1)
      const dy = clamp(
        (smoothed.value.y - center.y + shiftY) / (height * 0.24),
        -1,
        1,
      )

      return {
        x: dx * rangeX,
        y: dy * rangeY,
      }
    }

    const purpleTrack = track(purpleCenter, 7.5, 6)
    const blackTrack = track(blackCenter, 6.5, 5.5)
    const orangeTrack = track(orangeCenter, 7, 6)
    const yellowTrack = track(yellowCenter, 7, 6)

    const next = createMotion()

    next.purple.leftEye = makeEye(
      purpleTrack.x,
      purpleTrack.y,
      blink.purple.value,
    )
    next.purple.rightEye = makeEye(
      purpleTrack.x,
      purpleTrack.y,
      blink.purple.value,
    )
    next.purple.skew = clamp((purpleCenter.x - smoothed.value.x) / 34, -8, 8)

    next.black.leftEye = makeEye(blackTrack.x, blackTrack.y, blink.black.value)
    next.black.rightEye = makeEye(
      blackTrack.x,
      blackTrack.y,
      blink.black.value,
    )
    next.black.skew = clamp((blackCenter.x - smoothed.value.x) / 55, -6, 6)

    next.orange.leftEye = makeEye(
      orangeTrack.x,
      orangeTrack.y,
      blink.orange.value,
    )
    next.orange.rightEye = makeEye(
      orangeTrack.x,
      orangeTrack.y,
      blink.orange.value,
    )
    next.orange.skew = clamp((orangeCenter.x - smoothed.value.x) / 44, -5, 5)

    next.yellow.leftEye = makeEye(
      yellowTrack.x,
      yellowTrack.y,
      blink.yellow.value,
    )
    next.yellow.rightEye = makeEye(
      yellowTrack.x,
      yellowTrack.y,
      blink.yellow.value,
    )
    next.yellow.skew = clamp((yellowCenter.x - smoothed.value.x) / 56, -5, 5)

    if (sceneState.focusField === 'email') {
      next.purple.leftEye = makeEye(3.5, 2.8, blink.purple.value)
      next.purple.rightEye = makeEye(3.5, 2.8, blink.purple.value)
      next.black.leftEye = makeEye(-1.5, -3, blink.black.value)
      next.black.rightEye = makeEye(-1.5, -3, blink.black.value)
      next.purple.shiftX = 18
      next.purple.skew -= 4
      next.black.shiftX = -8
      next.black.skew += 3.4
      next.purple.stretch = 1.05
      next.orange.mouth = { ...BASE_PALETTE.flatMouth, width: 18 }
    }

    if (sceneState.focusField === 'password' && sceneState.passwordLength > 0) {
      next.black.shiftY = -6
      next.yellow.leftEye = makeEye(-4, -4.5, blink.yellow.value)
      next.yellow.rightEye = makeEye(-4, -4.5, blink.yellow.value)
      next.orange.leftEye = makeEye(-4.2, -3.6, blink.orange.value)
      next.orange.rightEye = makeEye(-4.2, -3.6, blink.orange.value)
      next.yellow.mouth = { ...BASE_PALETTE.flatMouth, width: 58 }

      if (sceneState.passwordVisible) {
        next.purple.leftEye = makeEye(4.5, 4.8, blink.purple.value)
        next.purple.rightEye = makeEye(4.5, 4.8, blink.purple.value)
        next.purple.shiftX = 8
        next.purple.shiftY = -10
        next.purple.skew = 0
        next.black.leftEye = makeEye(-3, -4, blink.black.value)
        next.black.rightEye = makeEye(-3, -4, blink.black.value)
      } else {
        next.purple.leftEye = makeEye(-4.8, -4.4, blink.purple.value)
        next.purple.rightEye = makeEye(-4.8, -4.4, blink.purple.value)
        next.purple.shiftX = 28
        next.purple.skew -= 8
        next.purple.stretch = 1.09
        next.black.skew += 1.4
      }
    }

    if (sceneState.authStatus === 'loading') {
      next.purple.shiftY = -4
      next.black.shiftY = -2
      next.orange.shiftY = -3
      next.yellow.shiftY = -2
      next.purple.stretch = 1.02
      next.yellow.stretch = 1.01
      next.yellow.mouth = { ...BASE_PALETTE.flatMouth, width: 44 }
    }

    if (sceneState.authStatus === 'success') {
      next.purple.leftEye = makeEye(0, -6, false)
      next.purple.rightEye = makeEye(0, -6, false)
      next.black.leftEye = makeEye(0, -6, false)
      next.black.rightEye = makeEye(0, -6, false)
      next.orange.leftEye = makeEye(0, -6, false)
      next.orange.rightEye = makeEye(0, -6, false)
      next.yellow.leftEye = makeEye(0, -6, false)
      next.yellow.rightEye = makeEye(0, -6, false)
      next.purple.mouth = { ...BASE_PALETTE.smileMouth }
      next.orange.mouth = { ...BASE_PALETTE.smileMouth, width: 38 }
      next.yellow.mouth = { ...BASE_PALETTE.smileMouth, width: 50 }
      next.purple.shiftY = -12
      next.orange.shiftY = -9
      next.yellow.shiftY = -7
      next.black.shiftY = -6
    }

    if (sceneState.authStatus === 'error') {
      next.purple.mouth = { ...BASE_PALETTE.sadMouth }
      next.orange.mouth = { ...BASE_PALETTE.sadMouth, width: 34 }
      next.yellow.mouth = { ...BASE_PALETTE.flatMouth, width: 50 }
      next.black.leftEye = makeEye(0, 1.8, blink.black.value)
      next.black.rightEye = makeEye(0, 1.8, blink.black.value)
      next.black.shiftY = 4
    }

    motion.value = next
  })

  /**
   * 监听舞台 DOM 是否挂载完成，并在首次可用时初始化平滑指针中心点。
   * 这样角色不会在首帧从 `(0, 0)` 猛跳到场景中心。
   */
  watch(
    () => stageRef.value,
    (element) => {
      if (!element) return

      smoothed.value = {
        x: (bounds.width.value || 560) / 2,
        y: (bounds.height.value || 384) / 2,
      }
    },
    { immediate: true },
  )

  /**
   * 监听页面可见性，在后台标签页中暂停 RAF，避免无意义动画开销。
   */
  watch(
    documentVisibility,
    (state) => {
      if (state === 'hidden') {
        pause()
        return
      }

      resume()
    },
    { immediate: true },
  )

  scheduleBlink('purple')
  scheduleBlink('black')
  scheduleBlink('orange')
  scheduleBlink('yellow')

  /**
   * 卸载时统一清理 blink timer，避免场景离开后仍有异步状态写入。
   */
  onBeforeUnmount(() => {
    resetBlinking()
  })

  return {
    stageRef,
    motion,
    reducedMotion,
  }
}
