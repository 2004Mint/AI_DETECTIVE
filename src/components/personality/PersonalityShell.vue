<script setup lang="ts">
/**
 * AI 人格研究所 · 页面外壳
 *
 * 与「AI 鉴定师」「AI 造梦事务所」共用同一套视觉：暖可可夜底 + 研小鸿 + 左上角返回游乐场。
 * 这里只做顶栏与页脚，具体内容交给各页面。
 */
import { RouterLink } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import MascotPet from '@/components/MascotPet.vue'
import '@/assets/personality.css'
</script>

<template>
  <div class="pl-scope flex min-h-dvh flex-col">
    <header class="sticky top-0 z-30 border-b border-white/5 bg-night/70 backdrop-blur-xl">
      <div class="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-5">
        <div class="flex min-w-0 items-center gap-2.5">
          <!-- 返回游乐场：与另外两个活动保持一致的位置 -->
          <RouterLink
            to="/"
            class="flex shrink-0 items-center gap-0.5 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-2.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="返回 AI 灵感游乐场"
          >
            <ChevronLeft :size="13" aria-hidden="true" />
            游乐场
          </RouterLink>

          <span class="h-4 w-px shrink-0 bg-white/10" aria-hidden="true" />

          <RouterLink to="/personality" class="flex min-w-0 items-center gap-2.5" aria-label="AI 人格研究所首页">
            <MascotPet :size="28" class="shrink-0" />
            <span class="min-w-0 leading-none">
              <span class="block truncate text-[13.5px] font-bold tracking-tight text-white">
                AI 人格研究所
              </span>
              <span class="mt-1 block text-[8px] font-medium tracking-[0.26em] text-slate-500">
                PERSONALITY LAB
              </span>
            </span>
          </RouterLink>
        </div>

        <slot name="right" />
      </div>
    </header>

    <main class="relative z-10 mx-auto w-full max-w-md flex-1 px-5 pb-10">
      <slot />
    </main>

    <footer class="mt-auto px-5 pb-10 text-center">
      <p class="text-[10px] leading-5 text-slate-500">重庆外语外事学院 · 人工智能学生研讨与实践社</p>
      <p class="mt-1 text-[10px] text-slate-600">结果仅供娱乐，不作为心理测评依据</p>
    </footer>
  </div>
</template>
