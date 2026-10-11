<script setup lang="ts">
/**
 * 答题结果弹窗：判定 / 实际身份 / 得分 / 研小鸿贴士 / 下一关
 *
 * 说明：曾展示的「AI 破绽」知识卡已按需求移除 —— 因为题目是按题材随机配对的，
 * 逐条描述具体画面的讲解很容易和随机抽到的图片对不上，反而误导玩家。
 */
import { computed } from 'vue'
import { ChevronRight, TrendingUp } from 'lucide-vue-next'
import type { Question, Side } from '@/types/game'
import MascotBubble from '@/components/MascotBubble.vue'
import { MASCOT_MOOD } from '@/components/MascotPet.vue'

const props = defineProps<{
  visible: boolean
  correct: boolean
  choice: Side
  question: Question
  /** 本题得分（含连击奖励） */
  gained: number
  bonus: number
  /** 是否为最后一关 */
  isLastRound: boolean
}>()

const emit = defineEmits<{
  /** 下一关 / 查看成绩 */
  next: []
}>()

/** 由 AI 生成的是哪张 / 真实照片是哪张 */
const aiSide = computed<Side>(() => (props.question.imageA.type === 'ai' ? 'A' : 'B'))
const otherSide = computed<Side>(() => (aiSide.value === 'A' ? 'B' : 'A'))
const aiImage = computed(() =>
  props.question.imageA.type === 'ai' ? props.question.imageA : props.question.imageB,
)
const realImage = computed(() =>
  props.question.imageA.type === 'real' ? props.question.imageA : props.question.imageB,
)

const face = computed(() => (props.correct ? '🎉 鉴定成功！' : '😵 鉴定失败！'))
const verdictColor = computed(() =>
  props.correct
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-orange-400'
    : 'text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300',
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-end justify-center bg-night-deep/70 backdrop-blur-sm sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="correct ? '鉴定成功' : '鉴定失败'"
      >
        <div
          class="modal-panel panel-caramel max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[1.75rem] border border-amber-200/25 p-5 pb-safe shadow-2xl sm:rounded-[1.75rem]"
        >
          <!-- 头部：判定 -->
          <div class="text-center">
            <p class="animate-pop-in text-5xl" aria-hidden="true">{{ correct ? '🎉' : '😵' }}</p>
            <h2 class="mt-2 font-display text-2xl font-black">
              <span :class="verdictColor">{{ face }}</span>
            </h2>
            <p v-if="!correct" class="mt-1 text-sm text-slate-300">
              正确答案是 <b class="text-amber-300">图片 {{ aiSide }}</b> 哦～
            </p>
          </div>

          <!-- 实际身份两枚徽章 -->
          <div class="mt-4 grid grid-cols-2 gap-3">
            <div
              class="glass flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              :class="choice === aiSide && !correct ? 'ring-2 ring-rose-400/70' : ''"
            >
              <img
                :src="aiImage.url"
                :alt="`图片${aiSide}`"
                class="h-10 w-10 rounded-xl object-cover"
              />
              <div class="min-w-0">
                <p class="text-[10px] font-semibold text-slate-400">图片 {{ aiSide }}</p>
                <p class="truncate text-sm font-black text-amber-300">🤖 AI 生成</p>
              </div>
            </div>
            <div
              class="glass flex items-center gap-2.5 rounded-2xl px-3 py-2.5"
              :class="choice === otherSide && !correct ? 'ring-2 ring-rose-400/70' : ''"
            >
              <img
                :src="realImage.url"
                :alt="`图片${otherSide}`"
                class="h-10 w-10 rounded-xl object-cover"
              />
              <div class="min-w-0">
                <p class="text-[10px] font-semibold text-slate-400">图片 {{ otherSide }}</p>
                <p class="truncate text-sm font-black text-slate-200">📷 {{ question.realLabel }}</p>
              </div>
            </div>
          </div>

          <!-- 得分区域 -->
          <div
            class="mt-3 flex items-center justify-center gap-2 rounded-2xl py-2.5 text-center"
            :class="correct ? 'bg-amber-400/10' : 'bg-rose-400/10'"
          >
            <template v-if="correct">
              <p class="font-display text-2xl font-black text-amber-300">+{{ gained }}</p>
              <span v-if="bonus > 0" class="flex items-center gap-1 text-xs font-bold text-amber-200">
                <TrendingUp :size="13" aria-hidden="true" />
                连击奖励 +{{ bonus }}
              </span>
            </template>
            <p v-else class="text-sm font-bold text-rose-300">连击中断了… 下一题重新开始！</p>
          </div>

          <!-- 研小鸿贴士（答对/答错情绪联动） -->
          <div class="mt-4 flex justify-center">
            <MascotBubble
              :text="question.aiHint"
              size="sm"
              :floaty="false"
              tone="dark"
              :emotion="correct ? MASCOT_MOOD.correct : MASCOT_MOOD.wrong"
            />
          </div>

          <!-- 下一关 -->
          <button type="button" class="btn-primary mt-5 w-full pb-safe" @click="emit('next')">
            {{ isLastRound ? '查看成绩' : '下一关' }}
            <ChevronRight :size="19" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
