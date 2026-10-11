<script setup lang="ts">
/**
 * 游戏主视图：第 X/10 关 · 二选一鉴定 · 揭晓答案弹窗 · 积分 HUD
 *
 * 交互节奏（选中 → 确认 → 判定揭晓）：
 * 1. 点图片 = 选中（高亮 + 「已选中」角标），可以随时改选，**不会直接提交**；
 * 2. 点右上角 🔍 = 放大查看该图（完整未裁切原图），不影响选择；
 * 3. 点底部「确认选择」才锁定答案 → 短暂悬念 ~0.75s → 判定揭晓（卡片盖章 + 弹窗）。
 *
 * 安全措施：确认后立即锁定，防连点/双卡同选；本题答完前不可再次作答。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Home, ScanSearch, ShieldCheck } from 'lucide-vue-next'
import { useGameStore } from '@/stores/game'
import type { AnswerResult, Side } from '@/types/game'
import GameProgress from '@/components/GameProgress.vue'
import QuestionCard from '@/components/QuestionCard.vue'
import ScorePanel from '@/components/ScorePanel.vue'
import ResultModal from '@/components/ResultModal.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'
import MascotBubble from '@/components/MascotBubble.vue'
import { MASCOT_MOOD } from '@/components/MascotPet.vue'
import { TOTAL_ROUNDS } from '@/utils/scoring'

const router = useRouter()
const game = useGameStore()

/* ---------------- 展示状态 ---------------- */
/** 是否已锁定（已点确认、正在判定或已揭晓） */
const locked = ref(false)
/** 当前选中的一侧（选中 ≠ 已提交，可以改选） */
const chosen = ref<Side | null>(null)
/** 正在放大查看的一侧（null = 关闭） */
const zoomSide = ref<Side | null>(null)
const reveal = ref(false)
const result = ref<AnswerResult | null>(null)
/** 实际提交的选项（非空 等价于 reveal） */
const lastSide = ref<Side | null>(null)
const gain = ref<{ key: number; gained: number; bonus: number } | null>(null)

const question = computed(() => game.currentQuestion)

let suspenseTimer: number | undefined
let gainTimer: number | undefined

function clearTimers() {
  if (suspenseTimer) window.clearTimeout(suspenseTimer)
  if (gainTimer) window.clearTimeout(gainTimer)
  suspenseTimer = undefined
  gainTimer = undefined
}

onBeforeUnmount(clearTimers)

/* ---------------- 研小鸿提示文案 ---------------- */
const IDLE_TIPS: ReadonlyArray<string> = [
  '先别急点～ AI 画的图常常“太完美”了！',
  '放大看看边缘和细节，研小鸿眼睛可尖了 👀',
  '观察光影和纹理：真实世界有“瑕疵”才是真的～',
  'AI 很会画“像”，但不一定画得“对”哦！',
  '水面的倒影、玻璃的反光，都是破绽高发区！',
  '注意不合理的小细节，比如多出来的手指…',
  '真实作品经得起放大，AI 一放大就露馅 ✨',
]

const CHEER = ['答对啦！这双眼睛可以送去鉴宝了 ✨', '厉害！连 AI 都逃不过你的法眼！', '教科书级鉴定！继续保持～'] as const
const OOPS = ['差一点点！看看 AI 破绽，下一题扳回来 💪', '没事～AI 确实越来越难骗了，下题再来！'] as const
/** 已选中、还没确认时的提醒（确认后不可反悔，所以给一次明确提示） */
const CONFIRM_TIPS = [
  '选好了？点下面「确认选择」提交，提交后就不能改啦～',
  '拿定主意再点确认哦，放大再看看也不迟 👀',
] as const

function pickBy<T>(arr: ReadonlyArray<T>, seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

/** 研小鸿本关提示语（按题目 id 稳定取一条） */
const foxTip = computed(() => {
  const q = question.value
  if (!q) return ''
  if (reveal.value) {
    return result.value?.correct ? pickBy(CHEER, q.id) : pickBy(OOPS, q.id)
  }
  if (chosen.value) return pickBy(CONFIRM_TIPS, q.id)
  return pickBy(IDLE_TIPS, q.id)
})

/* ---------------- 确认按钮文案 ---------------- */
/** 是否允许提交（已选中、未锁定、未揭晓） */
const canConfirm = computed(() => !locked.value && !reveal.value && chosen.value !== null)

const confirmText = computed(() => {
  if (reveal.value) return '已揭晓'
  if (locked.value) return '鉴定中…'
  if (!chosen.value) return '请先点选一张图片'
  return `确认选择 · 图片 ${chosen.value}`
})

/* 断点恢复：从首页「继续挑战」回到本页（或刷新）时，若当前题已经答过，
 * 直接恢复到「已揭晓 + 答案弹窗」状态，避免卡在无法作答的中间态 */
function restoreRevealedRound() {
  const q = game.currentQuestion
  const last = game.lastAnswer
  if (!q || !last || last.questionId !== q.id || game.status !== 'playing') return
  locked.value = true
  chosen.value = last.choice
  lastSide.value = last.choice
  result.value = { ...last, isLastRound: game.allAnswered }
  reveal.value = true
}
restoreRevealedRound()

/* ---------------- 交互 ---------------- */

/** 点选图片：只改变选中项，不提交（可以反复改选） */
function onPick(side: Side) {
  if (locked.value || reveal.value || !question.value) return
  chosen.value = side
}

/** 放大查看：不影响选择 */
function onZoom(side: Side) {
  zoomSide.value = side
}

/** 点「确认选择」才真正提交答案 */
function onConfirm() {
  const side = chosen.value
  if (!canConfirm.value || side === null || !question.value) return

  zoomSide.value = null // 万一还开着放大视图，先关掉
  locked.value = true

  // 悬念等待后揭晓判定
  suspenseTimer = window.setTimeout(() => {
    const r = game.answer(side)
    if (!r) {
      // 异常兜底：恢复可选状态
      locked.value = false
      return
    }
    result.value = r
    lastSide.value = side
    reveal.value = true
    if (r.correct) {
      gain.value = { key: Date.now(), gained: r.gained, bonus: r.bonus }
      gainTimer = window.setTimeout(() => {
        gain.value = null
      }, 1900)
    }
  }, 750)
}

function goNext() {
  if (!result.value) return
  if (result.value.isLastRound) {
    game.finishGame()
    router.replace('/result')
    return
  }
  game.nextRound()
  // 重置本关展示状态
  clearTimers()
  locked.value = false
  chosen.value = null
  zoomSide.value = null
  reveal.value = false
  result.value = null
  lastSide.value = null
  gain.value = null
}

const isLast = computed(() => result.value?.isLastRound ?? false)
</script>

<template>
  <section v-if="question" class="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pt-3">
    <!-- 顶部工具栏：返回首页（进度自动保存，可随时继续） -->
    <div class="mb-2.5 flex items-center justify-between gap-3">
      <button
        type="button"
        class="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 backdrop-blur transition hover:bg-white/10 active:scale-90"
        aria-label="返回首页（进度已自动保存）"
        @click="router.push('/')"
      >
        <Home :size="18" />
      </button>
      <p class="text-[10px] font-medium tracking-wide text-slate-500">
        返回首页 · 进度自动保存，可随时继续
      </p>
    </div>

    <!-- 顶部进度 -->
    <GameProgress :round="game.currentIndex + 1" :total="TOTAL_ROUNDS" :percent="game.progressPercent" />

    <!-- 题目区 -->
    <div class="flex-1">
      <h2 class="animate-fade-up mt-5 text-center font-display text-[21px] font-black leading-snug text-white">
        哪张图片是 <span class="text-candy">AI 生成</span> 的？
      </h2>
      <p class="mt-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
        <span class="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-slate-300">
          {{ question.category }}
        </span>
      </p>

      <!-- 研小鸿提示 -->
      <div v-if="!reveal" class="mt-3 flex justify-center">
        <MascotBubble
          :text="foxTip"
          size="sm"
          :floaty="false"
          tone="dark"
          :emotion="MASCOT_MOOD.hint"
        />
      </div>

      <!-- 二选一图片对决：上下排列（通用横屏 16:9） -->
      <div class="relative mx-auto mt-4 w-full max-w-xl sm:mt-6">
        <div class="grid gap-4">
          <QuestionCard
            :key="`${question.id}-A`"
            side="A"
            :src="question.imageA.url"
            :is-ai="question.imageA.type === 'ai'"
            :picked="chosen === 'A'"
            :answered="reveal"
            :locked="locked"
            :correct="result?.correct === true"
            aspect="video"
            @pick="onPick"
            @zoom="onZoom"
          />
          <QuestionCard
            :key="`${question.id}-B`"
            side="B"
            :src="question.imageB.url"
            :is-ai="question.imageB.type === 'ai'"
            :picked="chosen === 'B'"
            :answered="reveal"
            :locked="locked"
            :correct="result?.correct === true"
            aspect="video"
            @pick="onPick"
            @zoom="onZoom"
          />
        </div>

        <!-- VS 徽章：骑在 A/B 两张图的分界线上 -->
        <span
          aria-hidden="true"
          class="pointer-events-none absolute left-1/2 top-1/2 z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 rotate-[-6deg] place-items-center rounded-full bg-gradient-to-br from-amber-300 via-orange-400 to-rose-400 font-display text-[13px] font-black tracking-wider text-[#3f1a04] shadow-glow ring-2 ring-white/50"
        >
          VS
        </span>
      </div>

      <!-- 确认提交：点选图片只是选中，必须点这里才提交 -->
      <button
        v-if="!reveal"
        type="button"
        class="btn-primary mt-4 w-full text-base"
        :disabled="!canConfirm"
        @click="onConfirm"
      >
        <ShieldCheck :size="20" aria-hidden="true" />
        {{ confirmText }}
      </button>

      <p class="mt-3 text-center text-[11px] font-medium text-slate-500">
        先<b class="text-slate-300">点选</b>你认为由 AI 生成的那张，再点<b class="text-slate-300">确认</b>提交 ·
        点图片右上角放大：手机<b class="text-slate-300">双指捏合</b>、电脑<b class="text-slate-300">滚轮</b>细看
      </p>
    </div>

    <!-- 底部 HUD：积分 / 连击 -->
    <div class="mt-auto pb-safe pt-5">
      <ScorePanel
        :score="game.score"
        :combo="game.combo"
        :max-combo="game.maxCombo"
        :gain="gain"
      />
    </div>

    <!-- 答案弹窗 -->
    <ResultModal
      v-if="result && question && lastSide"
      :visible="reveal"
      :correct="result.correct"
      :choice="lastSide"
      :question="question"
      :gained="result.gained"
      :bonus="result.bonus"
      :is-last-round="isLast"
      @next="goNext"
    />

    <!-- 放大查看（只放大看图，不泄露哪张是 AI） -->
    <ImageLightbox
      :visible="zoomSide !== null"
      :side="zoomSide ?? 'A'"
      :src="zoomSide === 'B' ? question.imageB.url : question.imageA.url"
      @close="zoomSide = null"
    />
  </section>

  <!-- 兜底：题库为空/异常时给出返回入口 -->
  <section v-else class="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
    <p class="flex items-center gap-2 text-sm text-slate-400">
      <ScanSearch :size="18" class="animate-twinkle" aria-hidden="true" />
      正在准备题目……
    </p>
    <button type="button" class="btn-ghost mt-6" @click="router.replace('/rule')">返回规则页</button>
  </section>
</template>
