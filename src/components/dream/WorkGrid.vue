<script setup lang="ts">
/**
 * AI 造梦事务所 · 瀑布流网格
 *
 * CSS columns 实现不等高布局：手机 2 列，平板 3 列，大屏 4 列。
 * 卡片高度由作品原图比例决定。
 */
import WorkCard from './WorkCard.vue'
import type { DreamWork } from '@/types/dream'

withDefaults(
  defineProps<{
    works: readonly DreamWork[]
    /** 前 N 件立即加载 */
    eagerCount?: number
  }>(),
  { eagerCount: 0 },
)
</script>

<template>
  <div class="dream-masonry">
    <WorkCard
      v-for="(work, index) in works"
      :key="work.id"
      :work="work"
      :eager="index < eagerCount"
    />
  </div>
</template>
