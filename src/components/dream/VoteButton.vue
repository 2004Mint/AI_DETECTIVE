<script setup lang="ts">
/**
 * AI 造梦事务所 · 投票
 *
 * 未投票时是主色橙金按钮（与游戏 CTA 同一套渐变），投完变成玻璃质感的
 * 「已投票」状态并禁用；每台设备每件作品只能投 1 票。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { Check, Heart } from 'lucide-vue-next'
import { useDreamStore } from '@/stores/dream'
import { voteTotal } from '@/utils/dream'
import type { DreamWork } from '@/types/dream'

const props = defineProps<{ work: DreamWork }>()

const store = useDreamStore()
const voted = computed(() => store.hasVoted(props.work.id))
const votes = computed(() => voteTotal(props.work, store.votes))

const notice = ref('')
let noticeTimer: number | undefined

function flash(text: string) {
  notice.value = text
  if (noticeTimer) window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = ''
  }, 2400)
}

function onVote() {
  const result = store.vote(props.work.id)
  if (result === 'ok') flash('已记录你的投票')
  else if (result === 'already') flash('这件作品已经投过票了')
}

onBeforeUnmount(() => {
  if (noticeTimer) window.clearTimeout(noticeTimer)
})
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="dream-btn !px-4 !py-2.5"
        :class="voted ? 'dream-btn-quiet !text-slate-400' : 'dream-btn-primary'"
        :disabled="voted"
        :aria-pressed="voted"
        :aria-label="voted ? `已为${work.title}投票，共 ${votes} 票` : `为${work.title}投票`"
        @click="onVote"
      >
        <Check v-if="voted" :size="13" :stroke-width="2.6" aria-hidden="true" />
        <Heart v-else :size="13" aria-hidden="true" />
        {{ voted ? '已投票' : '投票' }}
        <span class="ml-0.5 text-[11px] tabular-nums opacity-70">{{ votes }}</span>
      </button>

      <p v-if="notice" class="text-[11px] text-slate-400" role="status">{{ notice }}</p>
    </div>

    <p class="mt-2 text-[10px] text-slate-600">每台设备每件作品限投 1 票</p>
  </div>
</template>
