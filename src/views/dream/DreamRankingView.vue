<script setup lang="ts">
/**
 * AI 造梦事务所 · 人气榜
 *
 * 一列到底：前三名用稍大的缩略图和名次颜色区分，其余同样式。
 * 不再使用大卡片、奖台或装饰。
 */
import { computed } from 'vue'
import DreamShell from '@/components/dream/DreamShell.vue'
import RankRow from '@/components/dream/RankRow.vue'
import EmptyState from '@/components/dream/EmptyState.vue'
import { useDreamStore } from '@/stores/dream'
import { allWorks, rankWorks } from '@/utils/dream'

const store = useDreamStore()
const ranked = computed(() => rankWorks(allWorks(), store.votes))
</script>

<template>
  <DreamShell>
    <div class="mx-auto max-w-2xl">
      <header class="pt-7">
        <h1 class="text-[24px] font-bold tracking-tight text-white" v-reveal="0">人气榜</h1>
        <p class="mt-1 text-[11.5px] text-slate-400">按现场投票结果排序</p>
      </header>

      <ol v-if="ranked.length > 0" class="mt-4 divide-y divide-white/5">
        <li v-for="(item, index) in ranked" :key="item.work.id" v-reveal="Math.min(index, 12) * 45">
          <RankRow :item="item" :top="item.rank <= 3" />
        </li>
      </ol>

      <EmptyState
        v-else
        class="mt-6"
        title="榜单还没有开始"
        hint="等作品上架、大家投完票，这里就会出现排名。"
      />
    </div>
  </DreamShell>
</template>
