<script setup lang="ts">
/**
 * 首页：标题渐入 + 吉祥物漂浮 + 「A ? VS B ?」对战小卡 + 开始挑战/继续挑战
 * 若存在未完成的挑战，主按钮变为「继续挑战」，直接回到上次的断点关卡。
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { History, Play } from 'lucide-vue-next'
import { useGameStore } from '@/stores/game'
import { TOTAL_ROUNDS } from '@/utils/scoring'
import MascotPet from '@/components/MascotPet.vue'

const router = useRouter()
const game = useGameStore()

/** 是否有可继续的挑战（正在游戏流程中且已开过局） */
const canContinue = computed(
  () => game.status === 'playing' && game.questions.length > 0,
)

/** 继续时从第几关进入（答完 10 题但未点结算时兜底显示第 10 关） */
const continueRound = computed(() => Math.min(game.answeredCount + 1, TOTAL_ROUNDS))

const ctaText = computed(() => (canContinue.value ? '继续挑战' : '开始挑战'))
const ctaHint = computed(() =>
  canContinue.value
    ? `从第 ${continueRound.value} / ${TOTAL_ROUNDS} 关继续 · 已答对 ${game.correctCount} 题`
    : '共 10 关 · 随机抽题不重复 · 答对赢积分和专属称号',
)

function onCta() {
  router.push(canContinue.value ? '/game' : '/rule')
}
</script>

<template>
  <section class="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 pb-safe pt-10 text-center">
    <!-- 社团横幅 -->
    <p class="animate-fade-up rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-orange-200/80 backdrop-blur">
      🧠 重庆外语外事学院 · 人工智能学生研讨与实践社
    </p>

    <!-- 主标题 -->
    <h1 class="mt-9">
      <span
        class="text-candy block font-display text-4xl font-black italic tracking-[0.06em] sm:text-5xl"
      >
        AI&nbsp;DETECTIVE
      </span>
      <span
        class="mt-3 block font-display text-[2.6rem] font-black leading-none text-white drop-shadow-[0_4px_18px_rgba(255,140,50,0.5)] sm:text-6xl"
      >
        AI 鉴定师
      </span>
    </h1>

    <!-- 对局小预览：A ? VS B ? -->
    <div class="mt-8 flex items-center gap-2.5" aria-hidden="true">
      <div
        class="animate-floaty grid h-16 w-16 -rotate-6 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/40 to-orange-400/25 font-display text-2xl font-black text-amber-100 ring-1 ring-amber-300/50"
        style="animation-delay: -0.6s"
      >
        A?
      </div>
      <span
        class="z-10 -mx-1 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 font-display text-[11px] font-black text-[#3f1a04] shadow-glow ring-2 ring-white/40"
      >
        VS
      </span>
      <div
        class="animate-floaty grid h-16 w-16 rotate-6 place-items-center rounded-2xl bg-gradient-to-br from-teal-400/30 to-cyan-400/20 font-display text-2xl font-black text-teal-100 ring-1 ring-teal-300/40"
        style="animation-delay: -1.8s"
      >
        B?
      </div>
    </div>

    <!-- 主文案 -->
    <p class="animate-fade-up mt-7 text-[15px] font-medium leading-7 text-slate-300 [animation-delay:0.15s]">
      当 AI 越来越像人，
      <br />
      你还能分辨出来吗？
    </p>

    <!-- 吉祥物：研小鸿 -->
    <div class="animate-fade-up relative mt-6 flex flex-col items-center [animation-delay:0.25s]">
      <p
        class="animate-pop-in relative z-10 mb-1 rotate-[-2deg] rounded-2xl rounded-br-sm bg-[#fff6e6]/95 px-4 py-2 text-[13px] font-semibold text-[#5a3a20] shadow-card"
      >
        咕嘎！{{ canContinue ? '回来啦！上次还没打完，继续吧！' : '我是研小鸿！AI 已经混进来了……你能把它找出来吗？' }}
      </p>
      <div class="relative -mt-1 grid place-items-center">
        <span
          class="animate-spin-slow absolute h-56 w-56 rounded-full border-2 border-dashed border-white/15"
          aria-hidden="true"
        />
        <span class="absolute h-44 w-44 rounded-full bg-brand/25 blur-3xl" aria-hidden="true" />
        <MascotPet :size="158" class="animate-floaty relative" />
      </div>
    </div>

    <!-- 开始挑战 / 继续挑战 -->
    <div class="animate-fade-up mt-7 flex w-full flex-col items-center [animation-delay:0.35s]">
      <button type="button" class="btn-primary w-full max-w-xs text-lg" @click="onCta">
        <History v-if="canContinue" :size="20" :stroke-width="2.6" aria-hidden="true" />
        <Play v-else :size="20" :stroke-width="2.6" aria-hidden="true" />
        {{ ctaText }}
      </button>
      <p class="mt-3 text-[11px] font-medium tracking-wider text-slate-400">
        {{ ctaHint }}
      </p>
      <p v-if="!canContinue" class="mt-1 text-[10px] text-slate-500">
        挑战中返回首页，进度会自动保存，随时可以继续
      </p>
    </div>

    <!-- 底部 -->
    <footer class="mt-auto pt-10">
      <p class="text-[11px] font-medium leading-5 text-slate-500">
        重庆外语外事学院
        <span class="mx-1 text-slate-600">·</span>
        人工智能学生研讨与实践社
      </p>
      <p class="mt-1 text-[10px] text-slate-600">AI 研习社 出品 · 招新互动体验 v1.0</p>
    </footer>
  </section>
</template>
