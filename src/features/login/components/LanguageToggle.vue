<script setup lang="tsx">
import globeIcon from '@/assets/icons/globe.svg'
import SvgMaskIcon from '@/features/login/components/SvgMaskIcon.vue'
import type { AppLocale } from '@/features/login/types'

/**
 * 语言切换器的输入契约。
 *
 * @example
 * const props: LanguageToggleProps = {
 *   locale: 'zh-CN',
 *   languageLabel: '语言',
 *   englishLabel: 'EN',
 *   chineseLabel: '中文',
 *   nextLocaleLabel: '切换到英文',
 * }
 */
interface LanguageToggleProps {
  /** 当前页面语言。 */
  locale: AppLocale
  /** 语言切换器标题。 */
  languageLabel: string
  /** 英文显示名。 */
  englishLabel: string
  /** 中文显示名。 */
  chineseLabel: string
  /** 当前按钮的可访问提示文案。 */
  nextLocaleLabel: string
}

/** 当前语言切换器接收的外部状态。 */
const props = defineProps<LanguageToggleProps>()

/** 语言切换器只负责抛出切换动作。 */
const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="props.nextLocaleLabel"
    :title="props.nextLocaleLabel"
    @click="emit('toggle')"
  >
    <span class="theme-toggle-icon" aria-hidden="true">
      <SvgMaskIcon :icon="globeIcon" size="0.78rem" />
    </span>
    <span class="theme-toggle-copy">
      <span class="theme-toggle-label">{{ props.languageLabel }}</span>
      <span class="theme-toggle-value">
        {{ props.locale === 'zh-CN' ? props.chineseLabel : props.englishLabel }}
      </span>
    </span>
  </button>
</template>
