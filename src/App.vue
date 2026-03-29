<script setup lang="tsx">
/**
 * 应用根节点当前只负责组合登录页。
 * 后续如果补路由或全局 provider，这里会成为最外层挂载点。
 */
import { defaultBrandConfig } from '@/features/login/config/brand'
import LoginPage from '@/features/login/LoginPage.vue'
</script>

<template>
  <LoginPage :brand="defaultBrandConfig" />
</template>
