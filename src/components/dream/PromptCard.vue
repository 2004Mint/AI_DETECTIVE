<script setup lang="ts">
/**
 * AI 造梦事务所 · 创作提示词
 *
 * 只是一段文字 + 一个复制按钮，不做成卡片。
 */
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ prompt?: string }>()

const copied = ref(false)
const copyFailed = ref(false)
let copiedTimer: number | undefined
let failedTimer: number | undefined

async function copyPrompt() {
  const text = props.prompt?.trim()
  if (!text) return
  try {
    if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
    await navigator.clipboard.writeText(text)
    copied.value = true
    if (copiedTimer) window.clearTimeout(copiedTimer)
    copiedTimer = window.setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    copyFailed.value = true
    if (failedTimer) window.clearTimeout(failedTimer)
    failedTimer = window.setTimeout(() => {
      copyFailed.value = false
    }, 2200)
  }
}

onBeforeUnmount(() => {
  if (copiedTimer) window.clearTimeout(copiedTimer)
  if (failedTimer) window.clearTimeout(failedTimer)
})
</script>

<template>
  <section class="border-t border-white/10 pt-5">
    <div class="flex items-baseline justify-between gap-3">
      <p class="text-[10px] font-semibold tracking-[0.18em] text-slate-500">PROMPT</p>
      <button
        v-if="prompt"
        type="button"
        class="text-[11px] font-medium text-slate-400 transition-colors hover:text-white"
        @click="copyPrompt"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>

    <p
      class="dream-serif mt-2.5 whitespace-pre-wrap break-words text-[13px] leading-7 text-slate-300"
    >
      {{ prompt || '提示词待补充。' }}
    </p>

    <p v-if="copyFailed" class="mt-2 text-[10px] text-rose-300" role="status">
      这台设备不支持一键复制，长按上面文字选中即可
    </p>
  </section>
</template>
