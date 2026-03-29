<script setup lang="tsx">
import moonIcon from '@/assets/icons/moon.svg'
import sunIcon from '@/assets/icons/sun.svg'
import SvgMaskIcon from '@/features/login/components/SvgMaskIcon.vue'
import type { ThemeMode } from '@/features/login/types'

/**
 * 主题切换器的输入契约。
 *
 * @example
 * const props: ThemeToggleProps = {
 *   theme: 'dark',
 *   themeLabel: 'Theme',
 *   darkLabel: 'Dark',
 *   lightLabel: 'Light',
 *   nextThemeLabel: 'Switch to light theme',
 * }
 */
interface ThemeToggleProps {
  /** 当前主题模式。 */
  theme: ThemeMode
  /** 主题分组标题。 */
  themeLabel: string
  /** 深色主题显示名。 */
  darkLabel: string
  /** 浅色主题显示名。 */
  lightLabel: string
  /** 当前按钮的可访问提示文案。 */
  nextThemeLabel: string
}

/** 当前主题切换器接收的外部状态。 */
const props = defineProps<ThemeToggleProps>()

/** 主题切换器只负责抛出切换动作。 */
const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="props.nextThemeLabel"
    :title="props.nextThemeLabel"
    @click="emit('toggle')"
  >
    <span class="theme-toggle-icon" aria-hidden="true">
      <SvgMaskIcon
        v-if="props.theme === 'dark'"
        :icon="sunIcon"
        size="0.8rem"
      />
      <SvgMaskIcon
        v-else
        :icon="moonIcon"
        size="0.78rem"
      />
    </span>
    <span class="theme-toggle-copy">
      <span class="theme-toggle-label">{{ props.themeLabel }}</span>
      <span class="theme-toggle-value">
        {{ props.theme === 'dark' ? props.darkLabel : props.lightLabel }}
      </span>
    </span>
  </button>
</template>
