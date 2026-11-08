<script setup lang="ts">
/**
 * AI 造梦事务所 · 人气榜
 *
 * 一列到底：前三名用稍大的缩略图和名次颜色区分，其余同样式。
 * 每行带一条相对第一名的占比条，方便一眼看出差距。
 *
 * 票数来源取决于是否配置了共享后端（VITE_VOTE_API）：
 * - 未配置：只统计本机投票，页面会如实标注「本机」；
 * - 已配置：显示全站实时票数，进入页面自动同步，可手动刷新。
 */
import { computed, onMounted } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import DreamShell from '@/components/dream/DreamShell.vue'
import RankRow from '@/components/dream/RankRow.vue'
import EmptyState from '@/components/dream/EmptyState.vue'
import { useDreamStore } from '@/stores/dream'
import { allWorks, rankWorks } from '@/utils/dream'

const store = useDreamStore()

/** 作品数据里的初始票数（往期累计） */
const baseVotes = allWorks().reduce((sum, work) => sum + (work.voteCount ?? 0), 0)

const ranked = computed(() => rankWorks(allWorks(), store.displayVotes))

/** 票数最高的作品票数，用来算占比条 */
const topVotes = computed(() => Math.max(1, ranked.value[0]?.votes ?? 1))

const shownVotes = computed(() =>
  Object.values(store.displayVotes).reduce((sum, count) => sum + count, 0),
)
const totalVotes = computed(() => baseVotes + shownVotes.value)
const votedWorks = computed(
  () => Object.values(store.displayVotes).filter((count) => count > 0).length,
)

/** 数据来源的说明文案 */
const sourceNote = computed(() => {
  if (!store.remoteEnabled) return '本机投票 · 每台设备每件作品限 1 票'
  switch (store.remoteState) {
    case 'loading':
      return '正在同步全站票数…'
    case 'ok':
      return '全站实时票数 · 所有人看到的是同一份榜单'
    case 'error':
      return '全站票数暂时同步失败，当前显示的是本机记录'
    default:
      return '全站票数 · 稍后自动同步'
  }
})

const syncing = computed(() => store.remoteState === 'loading')

onMounted(() => {
  void store.syncVotes()
})
</script>

<template>
  <DreamShell>
    <div class="mx-auto max-w-2xl">
      <header class="flex items-start justify-between gap-3 pt-7">
        <div>
          <h1 class="text-[24px] font-bold tracking-tight text-white" v-reveal="0">人气榜</h1>
          <p class="mt-1 text-[11.5px] text-slate-400">按现场投票结果排序</p>
        </div>

        <button
          v-if="store.remoteEnabled"
          type="button"
          class="mt-1 flex shrink-0 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300 transition-colors hover:bg-white/10 disabled:opacity-60"
          :disabled="syncing"
          @click="store.syncVotes()"
        >
          <RefreshCw :size="12" :class="syncing ? 'animate-spin' : ''" aria-hidden="true" />
          {{ syncing ? '同步中' : '刷新' }}
        </button>
      </header>

      <!-- 汇总 -->
      <div class="mt-4 grid grid-cols-3 gap-2" v-reveal="60">
        <div class="glass px-3 py-2.5">
          <p class="text-[9px] font-bold tracking-[0.18em] text-slate-500">TOTAL VOTES</p>
          <p class="mt-1 font-display text-[19px] font-black tabular-nums text-white">{{ totalVotes }}</p>
          <p class="text-[9.5px] text-slate-500">总票数</p>
        </div>
        <div class="glass px-3 py-2.5">
          <p class="text-[9px] font-bold tracking-[0.18em] text-slate-500">VOTED</p>
          <p class="mt-1 font-display text-[19px] font-black tabular-nums text-white">{{ votedWorks }}</p>
          <p class="text-[9.5px] text-slate-500">有票作品</p>
        </div>
        <div class="glass px-3 py-2.5">
          <p class="text-[9px] font-bold tracking-[0.18em] text-slate-500">WORKS</p>
          <p class="mt-1 font-display text-[19px] font-black tabular-nums text-white">{{ ranked.length }}</p>
          <p class="text-[9.5px] text-slate-500">参评作品</p>
        </div>
      </div>

      <p class="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-600" v-reveal="90">
        <span
          class="h-1 w-1 rounded-full"
          :class="store.remoteEnabled && store.remoteState === 'ok' ? 'bg-emerald-400' : 'bg-slate-600'"
          aria-hidden="true"
        />
        {{ sourceNote }}
      </p>

      <ol v-if="ranked.length > 0" class="mt-3 divide-y divide-white/5">
        <li v-for="(item, index) in ranked" :key="item.work.id" v-reveal="Math.min(index, 12) * 40">
          <RankRow
            :item="item"
            :top="item.rank <= 3"
            :percent="Math.round((item.votes / topVotes) * 100)"
            :voted="store.hasVoted(item.work.id)"
          />
        </li>
      </ol>

      <EmptyState
        v-else
        class="mt-6"
        title="榜单还没有开始"
        hint="等作品上架、大家投完票，这里就会出现排名。"
      />

      <p
        v-if="!store.remoteEnabled"
        class="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[10.5px] leading-5 text-slate-600"
      >
        票数只在这台设备上累计，换一台手机看到的是另一份记录；现场人气榜由工作人员统一汇总。
      </p>
        </div>
  </DreamShell>
</template>
