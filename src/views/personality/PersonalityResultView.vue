<script setup lang="ts">
/**
 * AI 人格研究所 · 结果页
 *
 * 结构：成功提示 → 档案卡（信息主体）→ 分享操作区 → 免责说明。
 * 操作区的主按钮跟人格主题色走，避免「橙色人格 + 橙色按钮」糊成一片。
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Check, Download, RotateCcw, Share2 } from 'lucide-vue-next'
import PersonalityShell from '@/components/personality/PersonalityShell.vue'
import PersonalityCard from '@/components/personality/PersonalityCard.vue'
import { usePersonalityStore } from '@/stores/personality'
import { downloadPersonalityCard } from '@/utils/personalityCard'
import type { OptionId } from '@/types/personality'

const router = useRouter()
const store = usePersonalityStore()
store.hydrate()

const OPTION_ORDER: readonly OptionId[] = ['A', 'B', 'C', 'D']

const result = computed(() => store.result)

/** 样本编号：由作答推导（4 进制序号），同一组答案永远一样 */
const sampleNo = computed(() => {
  let index = 0
  store.answers.forEach((id, position) => {
    const step = id ? OPTION_ORDER.indexOf(id) : 0
    index += Math.max(step, 0) * 4 ** position
  })
  return String(index + 1).padStart(4, '0')
})

const toast = ref('')
let toastTimer: number | undefined

function flash(message: string): void {
  toast.value = message
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    toast.value = ''
  }, 2200)
}

onMounted(() => {
  if (!store.complete) void router.replace({ name: 'personality-home' })
})

const shareText = computed(() => {
  const p = result.value?.personality
  if (!p) return ''
  return [
    `我的 AI 人格是「${p.name}」 ${p.code}`,
    p.declaration,
    `关键词：${p.keywords.join(' / ')}`,
    '—— AI 人格研究所 · 重庆外语外事学院',
  ].join('\n')
})

async function onShare(): Promise<void> {
  if (!result.value) return
  const text = shareText.value
  const shareApi = typeof navigator !== 'undefined' ? navigator.share : undefined

  if (typeof shareApi === 'function') {
    try {
      await shareApi.call(navigator, { title: 'AI 人格研究所', text })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    flash('结果文案已复制，去粘贴给朋友吧')
  } catch {
    flash('复制失败，可以直接截图保存')
  }
}

const saving = ref(false)
async function onSaveImage(): Promise<void> {
  if (!result.value || saving.value) return
  saving.value = true
  try {
    await downloadPersonalityCard(result.value, sampleNo.value)
    flash('结果图已生成，去相册/下载里看看')
  } catch {
    flash('图片生成失败，截图也可以')
  } finally {
    saving.value = false
  }
}

function onRetest(): void {
  store.reset()
  void router.push({ name: 'personality-quiz' })
}
</script>

<template>
  <PersonalityShell>
    <template #right>
      <span class="shrink-0 text-[9.5px] font-medium tracking-[0.2em] text-slate-500">RESULT</span>
    </template>

    <div v-if="result" class="pt-5" :style="{ '--accent': result.personality.accent }">
      <!-- 完成提示：很轻，不抢档案卡的风头 -->
      <p
        class="pl-rise mx-auto flex w-fit items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[10.5px] font-medium text-slate-400"
      >
        <Check :size="11" class="text-emerald-300/90" aria-hidden="true" />
        档案已生成
      </p>

      <div class="pl-rise mt-4">
        <PersonalityCard :result="result" :sample-no="sampleNo" />
      </div>

      <!-- 操作区 -->
      <div class="mt-6 grid gap-2">
        <button type="button" class="pl-cta" @click="onShare">
          <Share2 :size="16" :stroke-width="2.2" aria-hidden="true" />
          分享我的结果
        </button>

        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="pl-ghost" :disabled="saving" @click="onSaveImage">
            <Download :size="14" aria-hidden="true" />
            {{ saving ? '生成中…' : '保存结果图' }}
          </button>

          <button type="button" class="pl-ghost" @click="onRetest">
            <RotateCcw :size="14" aria-hidden="true" />
            重新测试
          </button>
        </div>
      </div>

      <p class="mt-5 text-center text-[10px] leading-5 text-slate-600">
        结果由本机规则生成，不联网、不上传答案。<br />
        同一个人格不一定只是你——它更像是一种此刻的倾向。
      </p>

      <!-- 轻量提示 -->
      <Transition name="pl-q">
        <p
          v-if="toast"
          class="fixed inset-x-0 bottom-8 z-40 mx-auto w-fit max-w-[85%] rounded-full border border-white/10 bg-night-deep/95 px-4 py-2 text-center text-[11.5px] text-slate-200 shadow-card backdrop-blur"
        >
          {{ toast }}
        </p>
      </Transition>
    </div>
  </PersonalityShell>
</template>
