<script setup lang="ts">
/**
 * AI 造梦事务所 · 作品卡片（瀑布流单元）
 *
 * 一行信息：标题 + 分类，票数作为低视觉权重的辅助信息。
 * 不放大卡片、不加边框阴影，让图片本身成为主角。
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Heart } from 'lucide-vue-next'
import WorkCover from './WorkCover.vue'
import { dreamCategoryOf } from '@/data/dream/categories'
import { useDreamStore } from '@/stores/dream'
import { voteTotal } from '@/utils/dream'
import type { DreamWork } from '@/types/dream'

const props = withDefaults(
  defineProps<{
    work: DreamWork
    /** 首屏作品立即加载 */
    eager?: boolean
  }>(),
  { eager: false },
)

const store = useDreamStore()
const category = computed(() => dreamCategoryOf(props.work.category))
const votes = computed(() => voteTotal(props.work, store.votes))
</script>

<template>
  <RouterLink
    :to="`/dream-studio/work/${work.id}`"
    class="group block transition-opacity duration-200 active:opacity-70"
  >
    <div class="overflow-hidden rounded-2xl ring-1 ring-white/10">
      <WorkCover :work="work" :eager="eager" />
    </div>

    <div class="mt-2 flex items-start gap-2">
      <div class="min-w-0 flex-1">
        <h3 class="line-clamp-2 text-[12.5px] font-medium leading-snug text-slate-100">
          {{ work.title }}
        </h3>
        <p class="mt-1 text-[10px] text-slate-500">{{ category?.short ?? '未分类' }}</p>
      </div>

      <span class="mt-[3px] inline-flex shrink-0 items-center gap-0.5 text-[10px] tabular-nums text-slate-500">
        <Heart :size="9" aria-hidden="true" />
        {{ votes }}
      </span>
    </div>
  </RouterLink>
</template>
