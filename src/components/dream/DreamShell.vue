<script setup lang="ts">
/**
 * AI 造梦事务所 · 页面外壳
 *
 * 视觉与「AI 鉴定师」统一：沿用 App.vue 的暖可可夜底与星空，
 * 这里只负责顶栏（返回游乐场 + 研小鸿 + 品牌 + 人气榜）和极简页脚。
 */
import { RouterLink } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import MascotPet from '@/components/MascotPet.vue'
import { DREAM_SITE } from '@/data/dream/site'
import '@/assets/dream.css'
</script>

<template>
  <div class="dream-scope flex min-h-dvh flex-col">
    <header class="sticky top-0 z-30 border-b border-white/5 bg-night/70 backdrop-blur-xl">
      <div class="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-5">
        <div class="flex min-w-0 items-center gap-2.5">
          <!-- 返回游乐场：二级活动的左上角统一入口 -->
          <RouterLink
            to="/"
            class="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="返回 AI 灵感游乐场"
          >
            <ChevronLeft :size="13" aria-hidden="true" />
            游乐场
          </RouterLink>

          <span class="h-4 w-px shrink-0 bg-white/10" aria-hidden="true" />

          <RouterLink
            to="/dream-studio"
            class="flex min-w-0 items-center gap-2.5"
            aria-label="AI 造梦事务所首页"
          >
            <MascotPet :size="28" class="shrink-0" />
            <span class="min-w-0 leading-none">
              <span class="block truncate text-[13.5px] font-bold tracking-tight text-white">
                {{ DREAM_SITE.title }}
              </span>
              <span class="mt-1 block text-[8px] font-medium tracking-[0.26em] text-slate-500">
                DREAM STUDIO
              </span>
            </span>
          </RouterLink>
        </div>

        <RouterLink
          to="/dream-studio/ranking"
          class="shrink-0 text-[12px] font-medium text-slate-300 transition-colors hover:text-white"
        >
          人气榜
        </RouterLink>
      </div>
    </header>

    <main class="relative z-10 mx-auto w-full max-w-5xl flex-1 px-5 pb-10">
      <slot />
    </main>

    <footer class="mt-auto px-5 pb-10 text-center">
      <p class="text-[10px] leading-5 text-slate-500">{{ DREAM_SITE.footerOrg }}</p>
      <p class="mt-1 text-[10px] text-slate-600">{{ DREAM_SITE.footerNote }}</p>
    </footer>
  </div>
</template>
