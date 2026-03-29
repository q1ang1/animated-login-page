<script setup lang="tsx">
import { computed } from 'vue'
import { createBrandLogoVariables } from '@/features/login/config/brand'
import type { BrandConfig } from '@/features/login/types'

/**
 * 品牌 logo 组件的输入契约。
 *
 * @example
 * const props: BrandLogoProps = {
 *   brand: defaultBrandConfig,
 *   mobile: false,
 * }
 */
interface BrandLogoProps {
  /** 当前品牌配置，包含品牌名、跳转地址和 logo 资源。 */
  brand: BrandConfig
  /** 是否使用移动端样式变量。 */
  mobile?: boolean
}

/** 当前品牌 logo 组件接收的配置。 */
const props = withDefaults(
  defineProps<BrandLogoProps>(),
  {
    mobile: false,
  },
)

/** 当前场景下 logo 外层需要挂载的 CSS 变量。 */
const logoVariables = computed(() =>
  createBrandLogoVariables(props.brand.logo, props.mobile ? 'mobile' : 'desktop'),
)
</script>

<template>
  <a :href="props.brand.homeHref" class="brand-logo-link" :class="{ 'is-mobile': props.mobile }">
    <span class="brand-logo-badge" :class="{ 'is-mobile': props.mobile }" :style="logoVariables">
      <img
        class="brand-logo-image"
        :src="props.brand.logo.src"
        :alt="props.brand.logo.alt"
        :width="props.brand.logo.width"
        :height="props.brand.logo.height"
      />
    </span>
    <span class="brand-logo-name">{{ props.brand.name }}</span>
  </a>
</template>
