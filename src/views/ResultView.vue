<script setup lang="ts">
/**
 * 结算页：分数滚动动画 + 数据统计 + 专属称号 + 再来一局 / 了解社团
 */
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, RotateCcw, Users } from 'lucide-vue-next'
import { useGameStore } from '@/stores/game'
import { titleOf, TOTAL_ROUNDS } from '@/utils/scoring'
import { useCountUp } from '@/utils/useCountUp'
import MascotBubble from '@/components/MascotBubble.vue'
import { mascotFrameForScore } from '@/components/MascotPet.vue'

const router = useRouter()
const game = useGameStore()

const { display, run } = useCountUp()

const title = computed(() => titleOf(game.correctCount))
const accuracy = computed(() => game.accuracy)

onMounted(() => {
  // 稍微延迟让页面先渲染出来，再滚动分数
  window.setTimeout(() => run(game.score, 1400), 350)
})

/* ---------------- 彩带（确定性生成，避免每次渲染跳动） ---------------- */
const CONFETTI_COLORS = ['#ffc14d', '#ff8a1c', '#ffd96b', '#ff5c8a', '#ff8787', '#ffb35c'] as const
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${((i * 37 + 5) % 100)}%`,
  delay: (i % 12) * 0.24,
  duration: 2.6 + (i % 6) * 0.35,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width: 6 + (i % 3) * 3,
  height: 10 + (i % 4) * 3,
}))

function replay() {
  game.startGame()
  router.push('/game')
}
</script>

<template>
  <section
    class="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 pb-safe pt-9 text-center"
  >
    <!-- 彩带庆祝 -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 overflow-hidden">
      <span
        v-for="c in CONFETTI"
        :key="c.id"
        class="animate-confetti-fall absolute rounded-sm"
        :style="{
          left: c.left,
          top: '-24px',
          width: `${c.width}px`,
          height: `${c.height}px`,
          backgroundColor: c.color,
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.duration}s`,
        }"
      />
    </div>

    <!-- 标题 -->
    <p class="animate-pop-in text-4xl" aria-hidden="true">🏁</p>
    <h1 class="animate-fade-up mt-2 font-display text-3xl font-black tracking-wide text-white">
      挑战完成！
    </h1>

    <!-- 最终得分（滚动动画） -->
    <div class="animate-fade-up mt-6 [animation-delay:0.1s]">
      <p class="text-[11px] font-black tracking-[0.3em] text-slate-400">最终得分</p>
      <p
        class="text-candy mt-1 font-display text-7xl font-black tabular-nums drop-shadow-[0_6px_24px_rgba(251,191,36,0.35)]"
      >
        {{ display.toLocaleString() }}
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="glass animate-fade-up mt-6 grid w-full grid-cols-3 divide-x divide-white/10 py-3.5 [animation-delay:0.18s]">
      <div>
        <p class="font-display text-2xl font-black text-emerald-300">
          {{ game.correctCount }}
          <span class="text-sm text-slate-400">/{{ TOTAL_ROUNDS }}</span>
        </p>
        <p class="mt-0.5 text-[10px] font-semibold tracking-widest text-slate-400">答对</p>
      </div>
      <div>
        <p class="font-display text-2xl font-black text-teal-300">{{ accuracy }}<span class="text-sm text-slate-400">%</span></p>
        <p class="mt-0.5 text-[10px] font-semibold tracking-widest text-slate-400">正确率</p>
      </div>
      <div>
        <p class="font-display text-2xl font-black text-amber-300">
          ×{{ game.maxCombo }}
        </p>
        <p class="mt-0.5 text-[10px] font-semibold tracking-widest text-slate-400">最高连击</p>
      </div>
    </div>

    <!-- 专属称号 -->
    <div class="animate-fade-up mt-6 w-full [animation-delay:0.26s]">
      <div
        class="relative mx-auto grid h-24 w-24 -rotate-3 place-items-center rounded-[1.75rem] bg-gradient-to-br ring-4 ring-white/20"
        :class="title.gradient"
      >
        <span class="text-5xl drop-shadow-lg" aria-hidden="true">{{ title.emoji }}</span>
        <span class="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-night-deep px-2 py-0.5 text-[9px] font-bold text-slate-300 ring-1 ring-white/20">
          专属称号
        </span>
      </div>
      <h2 class="mt-5 font-display text-2xl font-black text-white">
        恭喜获得「<span class="text-candy">{{ title.name }}</span>」
      </h2>
      <div class="mt-4 flex justify-center">
        <MascotBubble :text="title.comment" size="md" tone="light" :emotion="mascotFrameForScore(game.correctCount)" />
      </div>
    </div>

    <!-- 操作 -->
    <div class="animate-fade-up mt-7 flex w-full flex-col gap-3 [animation-delay:0.34s]">
      <button type="button" class="btn-primary w-full text-lg" @click="replay">
        <RotateCcw :size="19" aria-hidden="true" />
        再来一局
      </button>
      <button type="button" class="btn-ghost w-full" @click="router.push('/recruit')">
        <Users :size="18" aria-hidden="true" />
        了解 AI 研习社
      </button>
      <button
        type="button"
        class="mx-auto mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-200"
        @click="router.push('/')"
      >
        <Home :size="14" aria-hidden="true" />
        返回首页
      </button>
    </div>
  </section>
</template>
