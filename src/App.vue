<script setup lang="ts">
/**
 * 应用根组件：全局背景装饰 + 页面切换过渡 + 遮罩转场
 *
 * 「返回游乐场」的统一动画在全局监听：任何指回 `/` 的链接都走
 * 遮罩收缩进按钮的退场，不需要每个页面单独接一遍。
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import BgScenery from '@/components/BgScenery.vue'
import { isPageWiping, leaveToPlayground } from '@/utils/pageWipe'

const router = useRouter()

/** 捕获阶段拦截「回入口」的点击（RouterLink 的 guardEvent 会识别 defaultPrevented） */
function handleClick(event: MouseEvent): void {
  if (event.defaultPrevented) return
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  // 正在播转场时不要拦，交给浏览器默认导航
  if (isPageWiping()) return

  const target = event.target as Element | null
  const link = target?.closest?.('a[href]') as HTMLAnchorElement | null
  if (!link || link.hasAttribute('data-no-wipe')) return

  const url = new URL(link.href, window.location.href)
  if (url.origin !== window.location.origin) return

  const base = import.meta.env.BASE_URL.replace(/\/+$/, '')
  const home = `${base}/`
  if (url.pathname !== home && url.pathname !== '/') return
  // 已经在家门口就不用再演一遍
  if (window.location.pathname === url.pathname) return

  event.preventDefault()
  void leaveToPlayground({ push: () => router.push('/') })
}

onMounted(() => {
  document.addEventListener('click', handleClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClick, true)
})
</script>

<template>
  <!-- overflow-x-clip 而不是 hidden：hidden 会让这层变成滚动容器，页面里的 sticky 顶栏/分类栏会全部失效 -->
  <div class="relative min-h-dvh overflow-x-clip bg-night text-slate-100">
    <!-- 全局星空 / 光晕背景（纯装饰，不拦截点击） -->
    <BgScenery />

    <main class="relative z-10">
      <RouterView v-slot="{ Component, route }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="route.name" />
        </Transition>
      </RouterView>
    </main>

    <!-- 入口 → 活动页的遮罩转场：由 src/utils/pageWipe.ts 驱动（平时不可见、不拦截点击） -->
    <div id="page-wipe" class="page-wipe" aria-hidden="true">
      <div class="page-wipe-content">
        <span class="page-wipe-icon" aria-hidden="true" />
        <span class="page-wipe-kicker">ENTERING</span>
        <span class="page-wipe-title" />
        <span class="page-wipe-sub" />
      </div>
    </div>
  </div>
</template>
