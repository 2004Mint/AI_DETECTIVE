<script setup lang="ts">
/**
 * 底部 HUD：当前积分 + 连击状态
 * 积分变动时会播放数字弹跳；答题得分以 "+N" 文字向上飘动（rise-float）。
 */
import { computed, ref, watch } from 'vue'
import { Flame, Zap } from 'lucide-vue-next'

const props = defineProps<{
  score: number
  combo: number
  /** 本局最高连击 */
  maxCombo: number
  /** 答对一题后的得分飘字；{ key, gained, bonus }；wrong 时为 null */
  gain: { key: number; gained: number; bonus: number } | null
}>()

const activeFlame = computed(() => props.combo >= 2)

/** 得分飘字展示完 1.6s 后自动隐藏（配合 rise-float 动画） */
const showGain = ref(false)
watch(
  () => props.gain?.key,
  () => {
    showGain.value = false
    if (props.gain) {
      // 等待动画重触发
      requestAnimationFrame(() => {
        showGain.value = true
      })
    }
  },
)
</script>

<template>
  <div class="relative">
    <!-- +N 飘字 -->
    <Transition name="fade-in">
      <div
        v-if="showGain && gain"
        :key="gain.key"
        class="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 text-center"
        aria-hidden="true"
      >
        <p class="animate-rise-float font-display text-2xl font-black text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          +{{ gain.gained }}
        </p>
        <p
          v-if="gain.bonus > 0"
          class="animate-rise-float -mt-1 text-[11px] font-bold text-amber-200 [animation-delay:0.12s]"
        >
          连击奖励 +{{ gain.bonus }} ⚡
        </p>
      </div>
    </Transition>

    <div
      class="glass grid grid-cols-2 items-center divide-x divide-white/10 px-4 py-3"
      role="status"
    >
      <!-- 积分 -->
      <div class="flex items-center gap-3 pr-3">
        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-orange-400/20 text-orange-300">
          <Zap :size="19" aria-hidden="true" />
        </span>
        <div class="min-w-0">
          <p class="text-[10px] font-semibold tracking-[0.18em] text-slate-400">当前积分</p>
          <p
            :key="score"
            class="animate-pop-in font-display text-xl font-black leading-tight text-white tabular-nums"
          >
            {{ score.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- 连击 -->
      <div class="flex items-center justify-end gap-3 pl-3">
        <div class="min-w-0 text-right">
          <p class="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
            连击
            <span v-if="maxCombo > 0" class="text-amber-300/80">最高×{{ maxCombo }}</span>
          </p>
          <p
            class="font-display text-xl font-black leading-tight tabular-nums"
            :class="activeFlame ? 'text-amber-300' : 'text-slate-400'"
          >
            <template v-if="combo > 0">× {{ combo }}</template>
            <template v-else>暂无</template>
          </p>
        </div>
        <span
          :class="[
            'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
            activeFlame
              ? 'animate-flame bg-amber-400/25 text-amber-300 shadow-glow'
              : 'bg-white/10 text-slate-500',
          ]"
        >
          <Flame :size="19" aria-hidden="true" />
        </span>
      </div>
    </div>
  </div>
</template>
