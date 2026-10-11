<script setup lang="ts">
/**
 * 规则页：玩法说明 + 计分/连击规则 + 称号预告 + 开始鉴定
 */
import { useRouter } from 'vue-router'
import {
  Award,
  ChevronLeft,
  Flame,
  Layers,
  MousePointerClick,
  ScanSearch,
  Swords,
  TrendingUp,
} from 'lucide-vue-next'
import { useGameStore } from '@/stores/game'
import { POOL_STATS } from '@/api/questions'
import { BASE_SCORE } from '@/utils/scoring'

const router = useRouter()
const game = useGameStore()

/** 题材说明，例如「动物 / 美食 / 风景 / 绘画 4 大题材」 */
const categoryText =
  POOL_STATS.categoryLabels.length > 0
    ? `${POOL_STATS.categoryLabels.join(' / ')} ${POOL_STATS.categoryCount} 大题材`
    : '各大题材'

/** 素材库图片总数（AI 图 + 真实图） */
const assetCount = POOL_STATS.aiCount + POOL_STATS.realCount

/** 连击奖励预告（与 utils/scoring 保持一致） */
const COMBO_RULES = [
  { streak: 2, bonus: 50 },
  { streak: 3, bonus: 100 },
  { streak: 5, bonus: 200 },
] as const

/** 称号预告 */
const TITLE_PREVIEW = [
  { range: '10 题', name: '人类观察大师', emoji: '👑' },
  { range: '8~9', name: 'AI 鉴定师', emoji: '🕵️' },
  { range: '6~7', name: 'AI 侦察员', emoji: '🔍' },
  { range: '3~5', name: 'AI 观察员', emoji: '🔭' },
  { range: '0~2', name: 'AI 实习生', emoji: '🐣' },
] as const

function startGame() {
  game.startGame()
  router.push('/game')
}
</script>

<template>
  <section class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-safe pt-6">
    <!-- 返回 + 标题 -->
    <div class="animate-fade-up flex items-center gap-3">
      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur transition hover:bg-white/10 active:scale-90"
        aria-label="返回首页"
        @click="router.push('/')"
      >
        <ChevronLeft :size="20" />
      </button>
      <h1 class="font-display text-2xl font-black text-white">游戏规则</h1>
    </div>

    <!-- 玩法说明 -->
    <div class="glass animate-fade-up mt-5 p-5 [animation-delay:0.05s]">
      <p class="flex items-center gap-2 text-sm font-black tracking-widest text-orange-300">
        <ScanSearch :size="17" aria-hidden="true" /> 玩法
      </p>
      <p class="mt-3 text-[15px] font-medium leading-7 text-slate-200">
        每一关展示两张图片
        <span class="rounded-lg bg-white/10 px-1.5 py-0.5 font-black text-amber-300">A</span>
        <span class="mx-1 text-slate-500">与</span>
        <span class="rounded-lg bg-white/10 px-1.5 py-0.5 font-black text-teal-300">B</span>
        ，其中一张是 <b class="text-slate-50">真实的</b>（相机照片或人类画作），另一张由
        <b class="text-slate-50">AI 生成</b>。
      </p>
      <p class="mt-2 text-[15px] font-bold text-amber-200">
        请选出你认为「由 AI 生成」的那一张 🔍
      </p>
    </div>

    <!-- 规则列表 -->
    <ul class="animate-fade-up mt-4 space-y-2.5 [animation-delay:0.12s]">
      <li class="glass flex items-center gap-3 px-4 py-3">
        <Layers :size="19" class="shrink-0 text-amber-300" aria-hidden="true" />
        <p class="text-sm text-slate-200">
          <b class="text-white">共 10 关</b>，{{ categoryText }}均衡出题，同一局内不会重复
        </p>
      </li>
      <li class="glass flex items-center gap-3 px-4 py-3">
        <MousePointerClick :size="19" class="shrink-0 text-cyan-300" aria-hidden="true" />
        <p class="text-sm text-slate-200">
          先点选图片，再点<b class="text-white">「确认选择」</b>提交，避免手滑；点图片右上角可<b class="text-white">放大看原图</b>，
          手机双指捏合、电脑滚轮还能继续放大细看
        </p>
      </li>
      <li class="glass flex items-center gap-3 px-4 py-3">
        <TrendingUp :size="19" class="shrink-0 text-emerald-300" aria-hidden="true" />
        <p class="text-sm text-slate-200">
          答对 +<b class="text-emerald-300">{{ BASE_SCORE }}</b> 分，答错不得分、连击归零
        </p>
      </li>
      <li class="glass flex items-center gap-3 px-4 py-3">
        <Flame :size="19" class="shrink-0 text-amber-300" aria-hidden="true" />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-slate-200"><b class="text-white">连击奖励</b>：连续答对拿额外积分</p>
          <p class="mt-1.5 flex flex-wrap gap-1.5">
            <span
              v-for="r in COMBO_RULES"
              :key="r.streak"
              class="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-300"
            >
              🔥 连对 {{ r.streak }} 题 +{{ r.bonus }}
            </span>
          </p>
        </div>
      </li>
      <li class="glass flex items-center gap-3 px-4 py-3">
        <Award :size="19" class="shrink-0 text-rose-300" aria-hidden="true" />
        <p class="text-sm text-slate-200">通关后根据正确数量获得<b class="text-white">专属称号</b></p>
      </li>
    </ul>

    <!-- 称号预告 -->
    <div class="animate-fade-up mt-4 p-5 [animation-delay:0.18s]">
      <p class="text-center text-[11px] font-black tracking-[0.3em] text-slate-400">称号等级</p>
      <div class="mt-3 grid grid-cols-5 gap-1.5 text-center">
        <div
          v-for="t in TITLE_PREVIEW"
          :key="t.name"
          class="flex flex-col items-center gap-1 rounded-xl border border-white/5 bg-white/5 px-1 py-2.5"
        >
          <span class="text-xl" aria-hidden="true">{{ t.emoji }}</span>
          <span class="text-[9px] font-bold leading-tight text-slate-200">{{ t.name }}</span>
          <span class="text-[8px] text-slate-500">{{ t.range }}</span>
        </div>
      </div>
    </div>

    <!-- 开始 -->
    <div class="animate-fade-up mt-6 [animation-delay:0.25s]">
      <button type="button" class="btn-primary w-full text-lg" @click="startGame">
        <Swords :size="20" aria-hidden="true" />
        开始鉴定
      </button>
      <p class="mt-3 text-center text-[11px] text-slate-500">
        {{ assetCount }} 张素材随机配对 · 每局 10 题都不一样哦
      </p>
    </div>
  </section>
</template>
