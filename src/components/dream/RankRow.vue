<script setup lang="ts">
/**
 * AI 造梦事务所 · 排行榜行
 *
 * 一行只放：排名、缩略图、作品名、分类、票数。
 * 前三名用稍大的缩略图和颜色区分，不做大型卡片。
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import WorkCover from './WorkCover.vue'
import { dreamCategoryOf } from '@/data/dream/categories'
import type { RankedWork } from '@/utils/dream'

const props = defineProps<{
  item: RankedWork
  /** 前三名：略微放大 */
  top?: boolean
}>()

const category = computed(() => dreamCategoryOf(props.item.work.category))
const rankTone = computed(() => {
  switch (props.item.rank) {
    case 1:
      return 'text-amber-300'
    case 2:
      return 'text-slate-300'
    case 3:
      return 'text-orange-300'
    default:
      return 'text-slate-600'
  }
})
</script>

<template>
  <RouterLink
    :to="`/dream-studio/work/${item.work.id}`"
    class="flex items-center gap-3 py-3 transition-opacity active:opacity-60"
  >
    <span class="w-4 shrink-0 text-center text-[11px] font-semibold tabular-nums" :class="rankTone">
      {{ item.rank }}
    </span>

    <div
      class="shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10"
      :class="top ? 'h-12 w-12' : 'h-10 w-10'"
    >
      <WorkCover :work="item.work" thumb />
    </div>

    <div class="min-w-0 flex-1">
      <p
        class="truncate font-medium text-slate-100"
        :class="top ? 'text-[13.5px]' : 'text-[13px]'"
      >
        {{ item.work.title }}
      </p>
      <p class="mt-0.5 text-[10px] text-slate-500">{{ category?.short ?? '未分类' }}</p>
    </div>

    <span class="shrink-0 text-[11px] tabular-nums text-slate-400">{{ item.votes }}</span>
  </RouterLink>
</template>
