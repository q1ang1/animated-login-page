<script setup lang="tsx">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import type { CSSProperties } from 'vue'
import Eye from '@/features/login/components/characters/Eye.vue'

/**
 * 角色场景组件的输入契约。
 *
 * @example
 * const props: CharacterSceneProps = {
 *   isTyping: true,
 *   showPassword: false,
 *   passwordLength: 8,
 * }
 */
interface CharacterSceneProps {
  /** 邮箱输入框是否处于聚焦态。 */
  isTyping?: boolean
  /** 密码是否处于明文可见状态。 */
  showPassword?: boolean
  /** 当前密码长度。 */
  passwordLength?: number
}

/** 当前角色场景接收的页面状态。 */
const props = withDefaults(
  defineProps<CharacterSceneProps>(),
  {
    isTyping: false,
    showPassword: false,
    passwordLength: 0,
  },
)

/**
 * 安全清理递归 timeout，避免角色动画在组件卸载后继续执行。
 *
 * @param {number | undefined} timer 需要清理的定时器句柄。
 * @returns {void}
 *
 * @example
 * clearTimer(peekTimer)
 */
function clearTimer(timer: number | undefined) {
  if (timer) {
    window.clearTimeout(timer)
  }
}

/**
 * 根据角色元素中心点和当前鼠标位置计算脸部偏移与身体倾斜。
 * 这里保留原项目的数值范围，确保视觉行为尽量一致。
 *
 * @param {HTMLDivElement | null} target 当前角色主体元素。
 * 为 `null` 时会直接返回零位移，避免初始挂载阶段报错。
 * @param {number} mouseX 当前窗口鼠标 X 坐标。
 * @param {number} mouseY 当前窗口鼠标 Y 坐标。
 * @returns {{ faceX: number, faceY: number, bodySkew: number }} 脸部和身体的当前偏移数据。
 *
 * @example
 * const position = calculatePosition(purpleRef.value, 300, 240)
 */
function calculatePosition(target: HTMLDivElement | null, mouseX: number, mouseY: number) {
  if (!target) {
    return { faceX: 0, faceY: 0, bodySkew: 0 }
  }

  const rect = target.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 3

  const deltaX = mouseX - centerX
  const deltaY = mouseY - centerY

  return {
    faceX: Math.max(-15, Math.min(15, deltaX / 20)),
    faceY: Math.max(-10, Math.min(10, deltaY / 30)),
    bodySkew: Math.max(-6, Math.min(6, -deltaX / 120)),
  }
}

/** 场景层记录的全局鼠标 X 坐标，专门驱动角色整体位移。 */
const mouseX = ref(0)

/** 场景层记录的全局鼠标 Y 坐标，专门驱动角色整体位移。 */
const mouseY = ref(0)

/** 紫色角色当前是否闭眼。 */
const isPurpleBlinking = ref(false)

/** 黑色角色当前是否闭眼。 */
const isBlackBlinking = ref(false)

/** 邮箱输入聚焦后的短暂互看状态。 */
const isLookingAtEachOther = ref(false)

/** 密码明文显示时，紫色角色是否处于偷看瞬间。 */
const isPurplePeeking = ref(false)

/** 紫色角色主体节点。 */
const purpleRef = useTemplateRef<HTMLDivElement>('purpleRef')

/** 黑色角色主体节点。 */
const blackRef = useTemplateRef<HTMLDivElement>('blackRef')

/** 黄色角色主体节点。 */
const yellowRef = useTemplateRef<HTMLDivElement>('yellowRef')

/** 橙色角色主体节点。 */
const orangeRef = useTemplateRef<HTMLDivElement>('orangeRef')

/** 紫色角色下一次眨眼的定时器句柄。 */
let purpleBlinkTimer: number | undefined

/** 黑色角色下一次眨眼的定时器句柄。 */
let blackBlinkTimer: number | undefined

/** 邮箱聚焦后结束互看动作的定时器句柄。 */
let typingTimer: number | undefined

/** 触发下一次偷看动作的定时器句柄。 */
let peekTimer: number | undefined

/** 偷看动作持续 800ms 的收尾定时器句柄。 */
let peekActiveTimer: number | undefined

/**
 * 场景层保留一份鼠标坐标，专门驱动角色整体位移和身体倾斜。
 * 眼睛内部的瞳孔追踪则在 Eye 组件里按原仓库逻辑独立处理。
 *
 * @param {MouseEvent} event 当前窗口 mousemove 事件。
 * @returns {void}
 *
 * @example
 * window.addEventListener('mousemove', handleMouseMove)
 */
function handleMouseMove(event: MouseEvent) {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

/**
 * 紫色角色使用递归 timeout 生成不规则眨眼节奏。
 *
 * @returns {void}
 *
 * @example
 * schedulePurpleBlink()
 */
function schedulePurpleBlink() {
  purpleBlinkTimer = window.setTimeout(() => {
    isPurpleBlinking.value = true

    window.setTimeout(() => {
      isPurpleBlinking.value = false
      schedulePurpleBlink()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

/**
 * 黑色角色的眨眼逻辑与紫色角色一致，但状态独立。
 *
 * @returns {void}
 *
 * @example
 * scheduleBlackBlink()
 */
function scheduleBlackBlink() {
  blackBlinkTimer = window.setTimeout(() => {
    isBlackBlinking.value = true

    window.setTimeout(() => {
      isBlackBlinking.value = false
      scheduleBlackBlink()
    }, 150)
  }, Math.random() * 4000 + 3000)
}

/**
 * 只有在密码可见且已有输入时，紫色角色才会进入周期性偷看。
 * 每轮都重新排队，保证动作和原页一样是间歇触发。
 *
 * @returns {void}
 *
 * @example
 * schedulePeek()
 */
function schedulePeek() {
  peekTimer = window.setTimeout(() => {
    isPurplePeeking.value = true

    peekActiveTimer = window.setTimeout(() => {
      isPurplePeeking.value = false
      schedulePeek()
    }, 800)
  }, Math.random() * 3000 + 2000)
}

/** 当前是否处于“正在输入密码但仍然隐藏”的状态。 */
const isHidingPassword = computed(
  () => props.passwordLength > 0 && !props.showPassword,
)

/** 紫色角色根据鼠标位置得到的脸部和身体偏移。 */
const purplePosition = computed(() =>
  calculatePosition(purpleRef.value, mouseX.value, mouseY.value),
)

/** 黑色角色根据鼠标位置得到的脸部和身体偏移。 */
const blackPosition = computed(() =>
  calculatePosition(blackRef.value, mouseX.value, mouseY.value),
)

/** 黄色角色根据鼠标位置得到的脸部和身体偏移。 */
const yellowPosition = computed(() =>
  calculatePosition(yellowRef.value, mouseX.value, mouseY.value),
)

/** 橙色角色根据鼠标位置得到的脸部和身体偏移。 */
const orangePosition = computed(() =>
  calculatePosition(orangeRef.value, mouseX.value, mouseY.value),
)

/** 紫色角色左右眼在 X 轴上的强制朝向。 */
const purpleLookX = computed<number | undefined>(() => {
  if (props.passwordLength > 0 && props.showPassword) {
    return isPurplePeeking.value ? 4 : -4
  }

  if (isLookingAtEachOther.value) {
    return 3
  }

  return undefined
})

/** 紫色角色左右眼在 Y 轴上的强制朝向。 */
const purpleLookY = computed<number | undefined>(() => {
  if (props.passwordLength > 0 && props.showPassword) {
    return isPurplePeeking.value ? 5 : -4
  }

  if (isLookingAtEachOther.value) {
    return 4
  }

  return undefined
})

/** 黑色角色左右眼在 X 轴上的强制朝向。 */
const blackLookX = computed<number | undefined>(() => {
  if (props.passwordLength > 0 && props.showPassword) {
    return -4
  }

  if (isLookingAtEachOther.value) {
    return 0
  }

  return undefined
})

/** 黑色角色左右眼在 Y 轴上的强制朝向。 */
const blackLookY = computed<number | undefined>(() => {
  if (props.passwordLength > 0 && props.showPassword) {
    return -4
  }

  if (isLookingAtEachOther.value) {
    return -4
  }

  return undefined
})

/** 橙色和黄色角色在显示密码时共用的 X 轴强制朝向。 */
const sideCharacterLookX = computed<number | undefined>(() =>
  props.passwordLength > 0 && props.showPassword ? -5 : undefined,
)

/** 橙色和黄色角色在显示密码时共用的 Y 轴强制朝向。 */
const sideCharacterLookY = computed<number | undefined>(() =>
  props.passwordLength > 0 && props.showPassword ? -4 : undefined,
)

/** 紫色角色主体节点的行内样式。 */
const purpleCharacterStyle = computed<CSSProperties>(() => ({
  left: '70px',
  width: '180px',
  height: props.isTyping || isHidingPassword.value ? '440px' : '400px',
  backgroundColor: '#6C3FF5',
  borderRadius: '10px 10px 0 0',
  zIndex: 1,
  transform:
    props.passwordLength > 0 && props.showPassword
      ? 'skewX(0deg)'
      : props.isTyping || isHidingPassword.value
        ? `skewX(${purplePosition.value.bodySkew - 12}deg) translateX(40px)`
        : `skewX(${purplePosition.value.bodySkew}deg)`,
  transformOrigin: 'bottom center',
}))

/** 紫色角色眼睛容器的行内样式。 */
const purpleEyesStyle = computed<CSSProperties>(() => ({
  left:
    props.passwordLength > 0 && props.showPassword
      ? '20px'
      : isLookingAtEachOther.value
        ? '55px'
        : `${45 + purplePosition.value.faceX}px`,
  top:
    props.passwordLength > 0 && props.showPassword
      ? '35px'
      : isLookingAtEachOther.value
        ? '65px'
        : `${40 + purplePosition.value.faceY}px`,
}))

/** 黑色角色主体节点的行内样式。 */
const blackCharacterStyle = computed<CSSProperties>(() => ({
  left: '240px',
  width: '120px',
  height: '310px',
  backgroundColor: '#2D2D2D',
  borderRadius: '8px 8px 0 0',
  zIndex: 2,
  transform:
    props.passwordLength > 0 && props.showPassword
      ? 'skewX(0deg)'
      : isLookingAtEachOther.value
        ? `skewX(${blackPosition.value.bodySkew * 1.5 + 10}deg) translateX(20px)`
        : props.isTyping || isHidingPassword.value
          ? `skewX(${blackPosition.value.bodySkew * 1.5}deg)`
          : `skewX(${blackPosition.value.bodySkew}deg)`,
  transformOrigin: 'bottom center',
}))

/** 黑色角色眼睛容器的行内样式。 */
const blackEyesStyle = computed<CSSProperties>(() => ({
  left:
    props.passwordLength > 0 && props.showPassword
      ? '10px'
      : isLookingAtEachOther.value
        ? '32px'
        : `${26 + blackPosition.value.faceX}px`,
  top:
    props.passwordLength > 0 && props.showPassword
      ? '28px'
      : isLookingAtEachOther.value
        ? '12px'
        : `${32 + blackPosition.value.faceY}px`,
}))

/** 橙色角色主体节点的行内样式。 */
const orangeCharacterStyle = computed<CSSProperties>(() => ({
  left: '0px',
  width: '240px',
  height: '200px',
  zIndex: 3,
  backgroundColor: '#FF9B6B',
  borderRadius: '120px 120px 0 0',
  transform:
    props.passwordLength > 0 && props.showPassword
      ? 'skewX(0deg)'
      : `skewX(${orangePosition.value.bodySkew}deg)`,
  transformOrigin: 'bottom center',
}))

/** 橙色角色眼睛容器的行内样式。 */
const orangeEyesStyle = computed<CSSProperties>(() => ({
  left:
    props.passwordLength > 0 && props.showPassword
      ? '50px'
      : `${82 + orangePosition.value.faceX}px`,
  top:
    props.passwordLength > 0 && props.showPassword
      ? '85px'
      : `${90 + orangePosition.value.faceY}px`,
}))

/** 黄色角色主体节点的行内样式。 */
const yellowCharacterStyle = computed<CSSProperties>(() => ({
  left: '310px',
  width: '140px',
  height: '230px',
  backgroundColor: '#E8D754',
  borderRadius: '70px 70px 0 0',
  zIndex: 4,
  transform:
    props.passwordLength > 0 && props.showPassword
      ? 'skewX(0deg)'
      : `skewX(${yellowPosition.value.bodySkew}deg)`,
  transformOrigin: 'bottom center',
}))

/** 黄色角色眼睛容器的行内样式。 */
const yellowEyesStyle = computed<CSSProperties>(() => ({
  left:
    props.passwordLength > 0 && props.showPassword
      ? '20px'
      : `${52 + yellowPosition.value.faceX}px`,
  top:
    props.passwordLength > 0 && props.showPassword
      ? '35px'
      : `${40 + yellowPosition.value.faceY}px`,
}))

/** 黄色角色嘴部线条的行内样式。 */
const yellowMouthStyle = computed<CSSProperties>(() => ({
  left:
    props.passwordLength > 0 && props.showPassword
      ? '10px'
      : `${40 + yellowPosition.value.faceX}px`,
  top:
    props.passwordLength > 0 && props.showPassword
      ? '88px'
      : `${88 + yellowPosition.value.faceY}px`,
}))

/**
 * 监听邮箱输入框聚焦状态，驱动四个角色进入短暂互看动作。
 * 该 watch 只负责互看动画的开始和结束，不处理鼠标追踪本身。
 *
 * 触发条件：
 * `props.isTyping` 从 `false` 变为 `true` 或反向变化。
 *
 * 副作用：
 * 1. 清理上一次互看结束定时器。
 * 2. 在聚焦时将 `isLookingAtEachOther` 置为 `true`。
 * 3. 800ms 后恢复为正常状态。
 */
watch(
  () => props.isTyping,
  (value) => {
    clearTimer(typingTimer)

    if (value) {
      isLookingAtEachOther.value = true
      typingTimer = window.setTimeout(() => {
        isLookingAtEachOther.value = false
      }, 800)
      return
    }

    isLookingAtEachOther.value = false
  },
  { immediate: true },
)

/**
 * 监听密码长度和明文显示状态，决定是否启动紫色角色偷看动画。
 * 该 watch 只在“已有密码且当前显示明文”时安排周期性偷看。
 *
 * 触发条件：
 * `props.passwordLength` 或 `props.showPassword` 任一变化。
 *
 * 副作用：
 * 1. 清理已有偷看和收尾定时器。
 * 2. 重置 `isPurplePeeking`，避免旧状态残留。
 * 3. 满足条件时重新安排下一次偷看。
 */
watch(
  [() => props.passwordLength, () => props.showPassword],
  ([passwordLength, showPassword]) => {
    clearTimer(peekTimer)
    clearTimer(peekActiveTimer)
    isPurplePeeking.value = false

    if (passwordLength > 0 && showPassword) {
      schedulePeek()
    }
  },
  { immediate: true },
)

/**
 * 组件挂载后启动鼠标监听和两组随机眨眼。
 * 这里不在挂载阶段启动偷看逻辑，偷看由后续 watch 按密码状态决定。
 */
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  schedulePurpleBlink()
  scheduleBlackBlink()
})

/**
 * 卸载前移除全局监听并清空所有 timeout，避免角色动画越界写状态。
 */
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  clearTimer(purpleBlinkTimer)
  clearTimer(blackBlinkTimer)
  clearTimer(typingTimer)
  clearTimer(peekTimer)
  clearTimer(peekActiveTimer)
})
</script>

<template>
  <div class="relative h-[400px] w-[550px]">
    <div
      ref="purpleRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="purpleCharacterStyle"
    >
      <div
        class="absolute flex gap-8 transition-all duration-700 ease-in-out"
        :style="purpleEyesStyle"
      >
        <Eye
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          :offset-x="purpleLookX"
          :offset-y="purpleLookY"
          :closed="isPurpleBlinking"
        />
        <Eye
          :size="18"
          :pupil-size="7"
          :max-distance="5"
          :offset-x="purpleLookX"
          :offset-y="purpleLookY"
          :closed="isPurpleBlinking"
        />
      </div>
    </div>

    <div
      ref="blackRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="blackCharacterStyle"
    >
      <div
        class="absolute flex gap-6 transition-all duration-700 ease-in-out"
        :style="blackEyesStyle"
      >
        <Eye
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          :offset-x="blackLookX"
          :offset-y="blackLookY"
          :closed="isBlackBlinking"
        />
        <Eye
          :size="16"
          :pupil-size="6"
          :max-distance="4"
          :offset-x="blackLookX"
          :offset-y="blackLookY"
          :closed="isBlackBlinking"
        />
      </div>
    </div>

    <div
      ref="orangeRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="orangeCharacterStyle"
    >
      <div
        class="absolute flex gap-8 transition-all duration-200 ease-out"
        :style="orangeEyesStyle"
      >
        <Eye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          :with-sclera="false"
          :offset-x="sideCharacterLookX"
          :offset-y="sideCharacterLookY"
        />
        <Eye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          :with-sclera="false"
          :offset-x="sideCharacterLookX"
          :offset-y="sideCharacterLookY"
        />
      </div>
    </div>

    <div
      ref="yellowRef"
      class="absolute bottom-0 transition-all duration-700 ease-in-out"
      :style="yellowCharacterStyle"
    >
      <div
        class="absolute flex gap-6 transition-all duration-200 ease-out"
        :style="yellowEyesStyle"
      >
        <Eye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          :with-sclera="false"
          :offset-x="sideCharacterLookX"
          :offset-y="sideCharacterLookY"
        />
        <Eye
          :size="12"
          :pupil-size="12"
          :max-distance="5"
          :with-sclera="false"
          :offset-x="sideCharacterLookX"
          :offset-y="sideCharacterLookY"
        />
      </div>

      <div
        class="absolute h-[4px] w-20 rounded-full bg-[#2D2D2D] transition-all duration-200 ease-out"
        :style="yellowMouthStyle"
      />
    </div>
  </div>
</template>
