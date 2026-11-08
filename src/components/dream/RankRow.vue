<script setup lang="ts">
/**
 * AI 造梦事务所 · 排行榜行
 *
 * 一行放：排名、缩略图、作品名、分类 / 已投标记、票数、占比条。
 * 前三名用稍大的缩略图和名次颜色区分，不做大型卡片。
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
  /** 相对第一名的占比（0-100），用于底部细条 */
  percent?: number
  /** 这台设备是否给这件作品投过票 */
  voted?: boolean
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

      <p class="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
        <span class="flex items-center gap-1">
          <span
            class="h-1 w-1 shrink-0 rounded-full"
            :style="{ background: category?.accent ?? '#94a3b8' }"
            aria-hidden="true"
          />
          {{ category?.short ?? '未分类' }}
        </span>
        <span
          v-if="voted"
          class="rounded-full bg-brand/15 px-1.5 py-px text-[9px] font-medium text-brand-light"
        >
          已投
        </span>
      </p>

      <!-- 相对第一名的占比条 -->
      <div :class="item.votes > 0 ? 'bg-white/[0.06]' : 'bg-transparent'"
          class="mt-1.5 h-[3px] w-full overflow-hidden rounded-full"
          aria-hidden="true">
        <div
          class="h-full rounded-full bg-gradient-to-r from-brand/60 to-brand transition-[width] duration-500"
          :style="{ width: `${Math.max(percent ?? 0, item.votes > 0 ? 4 : 0)}%` }"
        />
      </div>
    </div>

    <span class="shrink-0 self-start text-[11px] tabular-nums text-slate-400">{{ item.votes }}</span>
  </RouterLink>
</template>
