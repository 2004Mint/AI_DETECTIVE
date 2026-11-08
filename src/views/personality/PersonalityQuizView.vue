<script setup lang="ts">
/**
 * AI 人格研究所 · 答题页
 *
 * 一次只显示一题：选中 → 高亮 → 320ms 后切下一题。
 * 可以随时返回上一题改答案；五题答完自动进结果页。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import PersonalityShell from '@/components/personality/PersonalityShell.vue'
import ProgressBar from '@/components/personality/ProgressBar.vue'
import QuestionCard from '@/components/personality/QuestionCard.vue'
import { QUESTION_COUNT } from '@/data/personality/questions'
import { usePersonalityStore } from '@/stores/personality'
import type { OptionId } from '@/types/personality'

const router = useRouter()
const store = usePersonalityStore()
store.hydrate()

/** 刚点下的选项（用于给即时反馈，切换后清空） */
const picked = ref<OptionId | null>(null)
let timer: number | undefined

/** 返回上一题时显示之前选过的答案 */
const shownPick = computed(() => picked.value ?? store.answers[store.current] ?? null)

onMounted(() => {
  // 已经答完的人直接看结果，不用再点一遍
  if (store.complete) void router.replace({ name: 'personality-result' })
})

onBeforeUnmount(() => {
  if (timer) window.clearTimeout(timer)
})

function select(id: OptionId): void {
  if (picked.value) return // 防连点
  store.choose(id)
  picked.value = id
  timer = window.setTimeout(() => {
    picked.value = null
    if (store.current >= QUESTION_COUNT - 1) {
      void router.push({ name: 'personality-result' })
    } else {
      store.next()
    }
  }, 320)
}

function goBack(): void {
  if (picked.value) return
  store.back()
}
</script>

<template>
  <PersonalityShell>
    <div class="pt-5">
      <ProgressBar :current="store.current + 1" :total="QUESTION_COUNT" />
    </div>

    <div class="mt-7">
      <Transition name="pl-q" mode="out-in">
        <QuestionCard
          :key="store.current"
          :question="store.question"
          :picked="shownPick"
          @select="select"
        />
      </Transition>
    </div>

    <div class="mt-8 flex items-center justify-between">
      <button
        v-if="store.current > 0"
        type="button"
        class="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 py-1.5 pl-1 pr-3 text-[11px] font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
        @click="goBack"
      >
        <ChevronLeft :size="13" aria-hidden="true" />
        上一题
      </button>
      <span v-else class="text-[10px] text-slate-600">慢慢选，没有时间限制</span>

      <span class="text-[10px] text-slate-600">选完自动进入下一题</span>
    </div>
  </PersonalityShell>
</template>
