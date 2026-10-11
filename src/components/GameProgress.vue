<script setup lang="ts">
/**
 * 游戏进度条：顶部 HUD —— 品牌名 + 第 X/10 关 + 进度条
 */
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  /** 当前第几关（1 起） */
  round: number
  /** 总关数 */
  total: number
  /** 0~100 完成百分比 */
  percent: number
}>()
</script>

<template>
  <div class="glass px-4 py-3">
    <div class="flex items-center justify-between gap-3">
      <p
        class="flex items-center gap-1.5 text-[11px] font-black tracking-[0.22em] text-orange-200"
      >
        <Sparkles :size="13" class="text-amber-300" aria-hidden="true" />
        AI DETECTIVE
      </p>
      <p class="whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
        第 <span class="text-base font-black text-amber-300">{{ round }}</span>
        <span class="text-slate-300">/{{ total }} 关</span>
      </p>
    </div>

    <div
      class="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="relative h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 transition-all duration-700 ease-out"
        :style="{ width: `${Math.max(4, percent)}%` }"
      >
        <span class="absolute inset-y-0 right-0 w-5 rounded-full bg-white/80 blur-md" />
      </div>
    </div>
  </div>
</template>
