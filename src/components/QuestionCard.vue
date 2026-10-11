<script setup lang="ts">
/**
 * 候选图片卡片（A / B）
 *
 * 状态机（全部由 props 驱动，组件无内部状态）：
 * - idle：可点选。点选只表示「选中」（放大 + 白色描边 + 「已选中」角标），
 *   **不会直接提交** —— 提交由游戏页底部的「确认」按钮负责；
 * - locked：已点确认、判定中，禁止改选；
 * - answered（已揭晓）：AI 图 = 琥珀发光圈 + "🤖 AI 生成"印章；真实图 = 真实照片标签；
 *   选错的那张会 Shake，并叠加 ✓ / ✗ 判定徽章。
 *
 * 右上角的「放大」按钮是独立按钮，点它只放大看图，不会改变选择。
 */
import { computed } from 'vue'
import { Check, X, ZoomIn } from 'lucide-vue-next'
import type { Side } from '@/types/game'

const props = withDefaults(
  defineProps<{
    /** A 或 B */
    side: Side
    /** 图片地址 */
    src: string
    /** 这张图是否为 AI 生成（揭晓后决定标签） */
    isAi: boolean
    /** 玩家是否选中了这张（选中不等于已提交） */
    picked: boolean
    /** 是否已揭晓答案 */
    answered: boolean
    /** 是否已确认、正在判定（禁止改选） */
    locked?: boolean
    /** 玩家本题是否答对（仅揭晓后有意义） */
    correct: boolean
    /** 画面比例：square = 1:1；video = 通用横屏 16:9（图片 object-cover 居中裁切） */
    aspect?: 'square' | 'video'
  }>(),
  { aspect: 'square', locked: false },
)

const emit = defineEmits<{
  /** 点选本卡片（只选中，不提交） */
  pick: [side: Side]
  /** 点右上角「放大」按钮 */
  zoom: [side: Side]
}>()

const rootClass = computed(() => {
  const base =
    'relative w-full select-none overflow-hidden rounded-3xl shadow-card ring-1 ring-white/10 bg-night-card transition-all duration-300'
  if (!props.answered) {
    if (props.picked) return `${base} z-10 scale-[1.04] ring-4 ring-white/85 brightness-110`
    if (props.locked) return base
    return `${base} hover:scale-[1.02] active:scale-[0.97]`
  }
  // 已揭晓：优先展示玩家判定结果
  const verdict = props.picked && !props.correct
  if (verdict) return `${base} animate-shake ring-4 ring-rose-400`
  if (props.picked && props.correct) return `${base} ring-4 ring-emerald-300`
  if (props.isAi) return `${base} animate-pulse-ring ring-4 ring-amber-300`
  return `${base} scale-[0.97] brightness-90`
})

/** 画面比例类：与 props.aspect 对应 */
const aspectClass = computed(() => (props.aspect === 'video' ? 'aspect-video' : 'aspect-square'))

/** 图片裁切时的 alt 文案 */
const altText = computed(() =>
  props.answered
    ? `图片${props.side}（${props.isAi ? 'AI生成' : '真实照片'}）`
    : `候选图片${props.side}`,
)

/** 角标配色：A=暖橙(研小鸿同款)，B=薄荷青（冷暖互补），字母用深色保证可读 */
const sideChip = computed(() =>
  props.side === 'A'
    ? 'bg-gradient-to-br from-amber-300 to-orange-500 text-[#3a1a04]'
    : 'bg-gradient-to-br from-teal-300 to-cyan-400 text-[#02474f]',
)
</script>

<template>
  <div :class="rootClass">
    <!-- 点选区域：只选中，不提交（提交在游戏页底部的「确认」按钮） -->
    <button
      type="button"
      class="block w-full text-left"
      :disabled="answered || locked"
      :aria-pressed="picked"
      :aria-label="`选择图片 ${side}${picked ? '（已选中）' : ''}`"
      @click="emit('pick', side)"
    >
      <!-- 图片：按比例容器 + object-cover 居中裁切 -->
      <div :class="['w-full overflow-hidden', aspectClass]">
        <img
          :src="src"
          :alt="altText"
          class="h-full w-full object-cover transition-transform duration-500"
          :class="{ 'scale-110': picked }"
          draggable="false"
          loading="eager"
          decoding="async"
        />
      </div>

      <!-- 角标 A / B -->
      <span
        :class="[
          'absolute left-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-xl font-display text-sm font-black shadow-lg',
          sideChip,
        ]"
      >
        {{ side }}
      </span>

      <!-- 选中角标：明确区分「已选中」和「已提交」 -->
      <span
        v-if="picked && !answered"
        class="animate-pop-in absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-black text-slate-800 shadow-lg backdrop-blur"
      >
        <Check :size="13" :stroke-width="3.4" aria-hidden="true" />
        已选中
      </span>

      <!-- 揭晓：身份印章 -->
      <span
        v-if="answered"
        class="animate-stamp absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-black tracking-wide shadow-lg"
        :class="
          isAi
            ? 'bg-amber-300/95 text-amber-950 shadow-glow-amber'
            : 'bg-white/90 text-slate-700 backdrop-blur'
        "
      >
        {{ isAi ? '🤖 AI 生成' : '📷 真实照片' }}
      </span>

      <!-- 揭晓：判定徽章（只出现在玩家选中的那张上） -->
      <span
        v-if="answered && picked"
        class="absolute inset-0 grid place-items-center"
        aria-hidden="true"
      >
        <span
          class="animate-pop-in grid h-16 w-16 place-items-center rounded-full text-white shadow-2xl ring-4 ring-white/40"
          :class="correct ? 'bg-emerald-500/95' : 'bg-rose-500/95'"
        >
          <Check v-if="correct" :size="36" :stroke-width="3.2" />
          <X v-else :size="36" :stroke-width="3.2" />
        </span>
      </span>
    </button>

    <!-- 放大查看：独立按钮，点它不会改变选择；确认后（判定中/已揭晓）禁用，
         避免放大视图盖住随后弹出的答案弹窗 -->
    <button
      type="button"
      class="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-xl border border-white/25 bg-night-deep/55 text-slate-100 shadow-lg backdrop-blur transition hover:bg-night-deep/80 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
      :disabled="locked"
      :aria-label="`放大查看图片 ${side}`"
      @click="emit('zoom', side)"
    >
      <ZoomIn :size="16" />
    </button>
  </div>
</template>
