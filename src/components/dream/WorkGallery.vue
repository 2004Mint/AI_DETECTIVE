<script setup lang="ts">
/**
 * AI 造梦事务所 · 作品画廊
 *
 * 首页分类切换与分类页共用：有作品就铺瀑布流，没有就显示轻量空状态。
 */
import WorkGrid from './WorkGrid.vue'
import EmptyState from './EmptyState.vue'
import type { DreamWork } from '@/types/dream'

withDefaults(
  defineProps<{
    works: readonly DreamWork[]
    emptyTitle?: string
    emptyHint?: string
  }>(),
  { emptyTitle: '作品正在布展中', emptyHint: '' },
)
</script>

<template>
  <WorkGrid v-if="works.length > 0" :works="works" :eager-count="4" />
  <div v-else class="flex min-h-[52vh] items-center justify-center">
    <EmptyState :title="emptyTitle" :hint="emptyHint" />
  </div>
</template>
