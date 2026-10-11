<script setup lang="ts">
/**
 * 应用根组件：全局背景装饰 + 页面切换过渡
 */
import { RouterView } from 'vue-router'
import BgScenery from '@/components/BgScenery.vue'
</script>

<template>
  <div class="relative min-h-dvh overflow-x-hidden bg-night text-slate-100">
    <!-- 全局星空 / 光晕背景（纯装饰，不拦截点击） -->
    <BgScenery />

    <main class="relative z-10">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.name" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
