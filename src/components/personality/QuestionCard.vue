<script setup lang="ts">
/**
 * AI 人格研究所 · 单题卡片
 *
 * 只负责展示一道题和四个选项；选哪个、什么时候翻页由页面决定。
 * 选中后立即高亮（`picked`），页面等 300ms 再切题，给一个明确的反馈。
 */
import type { OptionId, QuizQuestion } from '@/types/personality'

defineProps<{
  question: QuizQuestion
  /** 已选中的选项（返回上一题时能看到上次的选择） */
  picked?: OptionId | null
}>()

const emit = defineEmits<{
  (event: 'select', id: OptionId): void
}>()
</script>

<template>
  <div>
    <p class="text-[10px] font-bold tracking-[0.26em] text-brand-light/80">
      Q{{ String(question.index).padStart(2, '0') }} · {{ question.kicker }}
    </p>

    <h2 class="mt-3 text-[19px] font-bold leading-[1.55] tracking-tight text-white">
      {{ question.title }}
    </h2>

    <div class="mt-6 grid gap-2.5">
      <button
        v-for="option in question.options"
        :key="option.id"
        type="button"
        class="pl-option"
        :class="{ 'is-picked': picked === option.id }"
        :aria-pressed="picked === option.id"
        @click="emit('select', option.id)"
      >
        <span class="pl-option-key">{{ option.id }}</span>
        <span class="min-w-0 flex-1 text-[13.5px] leading-6 text-slate-200">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
