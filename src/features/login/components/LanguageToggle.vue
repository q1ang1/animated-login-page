<script setup lang="tsx">
import { Check } from '@element-plus/icons-vue'
import { ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon } from 'element-plus'
import globeIcon from '@/assets/icons/globe.svg'
import SvgMaskIcon from '@/features/login/components/SvgMaskIcon.vue'
import { computed, onBeforeUnmount, ref, useTemplateRef } from 'vue'
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

/**
 * 语言切换器负责两种交互：
 * 左侧主按钮直接在中英文之间切换，右侧下拉菜单负责显式选择具体语言。
 */
const emit = defineEmits<{
  toggle: []
  select: [locale: AppLocale]
}>()

type DropdownExpose = {
  handleClose?: () => void
}

const dropdownRef = useTemplateRef<DropdownExpose>('dropdownRef')
const dropdownDisabled = ref(false)
let restoreDropdownTimer: number | undefined

/**
 * 处理下拉菜单命令，只接受当前项目实际支持的语言代码。
 *
 * @param {string | number | object} command Element Plus `command` 事件透出的值。
 * @returns {void}
 */
function handleCommand(command: string | number | object) {
  if (command === 'en' || command === 'zh-CN') {
    emit('select', command)
  }
}

/**
 * 点击主按钮时只切换中英文，不让 hover dropdown 在同一次点击里意外弹出。
 */
function handleToggleClick() {
  dropdownDisabled.value = true
  dropdownRef.value?.handleClose?.()
  emit('toggle')

  if (restoreDropdownTimer) {
    window.clearTimeout(restoreDropdownTimer)
  }

  restoreDropdownTimer = window.setTimeout(() => {
    dropdownDisabled.value = false
  }, 180)
}

onBeforeUnmount(() => {
  if (restoreDropdownTimer) {
    window.clearTimeout(restoreDropdownTimer)
  }
})

/** 顶部工具条里只展示紧凑语言代码，避免视觉噪音。 */
const localeCode = computed(() => (props.locale === 'zh-CN' ? '中文' : 'EN'))
</script>

<template>
  <ElDropdown
    ref="dropdownRef"
    class="locale-dropdown"
    trigger="hover"
    placement="bottom-end"
    :disabled="dropdownDisabled"
    :show-timeout="120"
    :hide-timeout="90"
    popper-class="locale-dropdown-menu"
    @command="handleCommand"
  >
    <button
      type="button"
      class="locale-dropdown-trigger"
      :aria-label="props.nextLocaleLabel"
      :title="props.nextLocaleLabel"
      @click="handleToggleClick"
    >
      <SvgMaskIcon
        class="locale-dropdown-icon"
        :icon="globeIcon"
        size="0.95rem"
        aria-hidden="true"
      />
      <span class="locale-dropdown-value">{{ localeCode }}</span>
    </button>

    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem command="en">
          <span class="locale-dropdown-option" :class="{ 'is-active': props.locale === 'en' }">
            <span class="locale-dropdown-option-text">English</span>
            <ElIcon v-if="props.locale === 'en'" class="locale-dropdown-option-icon">
              <Check />
            </ElIcon>
          </span>
        </ElDropdownItem>
        <ElDropdownItem command="zh-CN">
          <span
            class="locale-dropdown-option"
            :class="{ 'is-active': props.locale === 'zh-CN' }"
          >
            <span class="locale-dropdown-option-text">中文</span>
            <ElIcon v-if="props.locale === 'zh-CN'" class="locale-dropdown-option-icon">
              <Check />
            </ElIcon>
          </span>
        </ElDropdownItem>
      </ElDropdownMenu>
    </template>
  </ElDropdown>
</template>

<style scoped>
.locale-dropdown {
  display: inline-flex;
  flex-shrink: 0;
}

.locale-dropdown-trigger {
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-width: 4rem;
  height: 24px;
  padding-inline: 0.5rem;
  border: 1px solid var(--theme-toggle-border);
  border-radius: 12px;
  background: var(--theme-toggle-background);
  color: var(--theme-toggle-value);
  cursor: pointer;
  backdrop-filter: blur(12px);
  transition: transform 180ms ease;
}

.locale-dropdown-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-toggle-value);
  flex-shrink: 0;
}

.locale-dropdown-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--theme-toggle-value);
  line-height: 1;
}

:global(.locale-dropdown-menu.el-popper) {
  /* 把 Element Plus 的 dropdown token 桥接到当前登录页主题，确保 teleport 出去的 popper 也跟随深浅色切换。 */
  --locale-dropdown-surface: color-mix(in srgb, var(--background) 92%, transparent);
  --locale-dropdown-surface-hover: color-mix(in srgb, var(--foreground) 8%, transparent);
  --el-bg-color-overlay: var(--locale-dropdown-surface);
  --el-border-color-light: var(--theme-toggle-border);
  --el-box-shadow-light: var(--theme-toggle-shadow);
  --el-text-color-regular: var(--muted-foreground);
  --el-text-color-primary: var(--foreground);
  --el-fill-color-light: var(--locale-dropdown-surface-hover);
  --el-color-primary: var(--foreground);
  border-radius: 1.125rem;
  padding: 0.375rem;
  backdrop-filter: blur(16px);
}

:global(.locale-dropdown-menu .el-dropdown-menu__item) {
  min-width: 8.25rem;
  border-radius: 0.875rem;
  padding: 0.625rem 0.75rem;
  color: var(--el-text-color-regular);
  transition:
    background-color 160ms ease,
    color 160ms ease;
}

:global(.locale-dropdown-menu .el-dropdown-menu__item:not(.is-disabled):hover),
:global(.locale-dropdown-menu .el-dropdown-menu__item:not(.is-disabled):focus) {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

:global(.locale-dropdown-menu .locale-dropdown-option) {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

:global(.locale-dropdown-menu .locale-dropdown-option.is-active) {
  color: var(--foreground);
  font-weight: 600;
}

:global(.locale-dropdown-menu .locale-dropdown-option-text) {
  line-height: 1;
}

:global(.locale-dropdown-menu .locale-dropdown-option-icon) {
  font-size: 0.875rem;
}

@media (hover: hover) and (pointer: fine) {
  .locale-dropdown-trigger:hover {
    transform: translateY(-1px);
  }
}

@media (max-width: 639px) {
  .locale-dropdown-trigger {
    min-width: 3.75rem;
    padding-inline: 0.5rem;
  }
}
</style>
