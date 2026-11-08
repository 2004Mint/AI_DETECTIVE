<script setup lang="ts">
/**
 * AI 人格研究所 · 答题进度
 *
 * 五段式进度条 + 「01 / 05」计数。
 * 段数直接来自题目数量，以后改成 6 题也不用动样式。
 */
import { computed } from 'vue'

const props = defineProps<{
  /** 当前题号，从 1 开始 */
  current: number
  /** 总题数 */
  total: number
}>()

const segments = computed(() => Array.from({ length: props.total }, (_, index) => index < props.current))
const padded = computed(() => String(props.current).padStart(2, '0'))
const padTotal = computed(() => String(props.total).padStart(2, '0'))
</script>

<template>
  <div>
    <div class="pl-progress" role="progressbar" :aria-valuenow="current" aria-valuemin="1" :aria-valuemax="total">
      <span
        v-for="(done, index) in segments"
        :key="index"
        class="pl-progress-seg"
        :class="{ 'is-done': done }"
      />
    </div>

    <div class="mt-2 flex items-baseline justify-between">
      <span class="text-[9.5px] font-bold tracking-[0.22em] text-slate-600">PROGRESS</span>
      <span class="font-display text-[13px] font-bold tabular-nums text-slate-300">
        {{ padded }} <span class="text-[10px] text-slate-600">/ {{ padTotal }}</span>
      </span>
    </div>
  </div>
</template>
