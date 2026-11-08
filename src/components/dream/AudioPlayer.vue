<script setup lang="ts">
/**
 * AI 造梦事务所 · 音乐试听
 *
 * 基础播放 / 暂停 + 进度拖动，视觉上只是一个细边框条，不做成卡片。
 * 仍基于原生 <audio>：不引入播放器依赖。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Loader2, Music, Pause, Play } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    src?: string
    title?: string
    /** 已知时长（秒），音频元数据加载前先显示 */
    duration?: number
  }>(),
  { src: '', title: '', duration: 0 },
)

const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const loading = ref(false)
const failed = ref(false)
const current = ref(0)
const total = ref(props.duration)

const hasSource = computed(() => Boolean(props.src))
const percent = computed(() =>
  total.value > 0 ? Math.min(100, Math.max(0, (current.value / total.value) * 100)) : 0,
)

function toggle() {
  const el = audioEl.value
  if (!el || !hasSource.value) return
  if (el.paused) {
    loading.value = true
    void el.play().catch(() => {
      failed.value = true
      loading.value = false
      playing.value = false
    })
  } else {
    el.pause()
  }
}

function onLoaded() {
  const el = audioEl.value
  if (!el) return
  loading.value = false
  failed.value = false
  if (Number.isFinite(el.duration) && el.duration > 0) total.value = el.duration
}

function onTimeUpdate() {
  const el = audioEl.value
  if (el) current.value = el.currentTime
}

function onSeek(event: Event) {
  const el = audioEl.value
  if (!el || total.value <= 0) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!Number.isFinite(value)) return
  el.currentTime = Math.min(Math.max(value, 0), total.value)
  current.value = el.currentTime
}

function onEnded() {
  playing.value = false
  current.value = 0
  const el = audioEl.value
  if (el) el.currentTime = 0
}

function onError() {
  failed.value = true
  loading.value = false
  playing.value = false
}

watch(
  () => props.src,
  () => {
    playing.value = false
    loading.value = false
    failed.value = false
    current.value = 0
    total.value = props.duration
    audioEl.value?.load()
  },
)

onBeforeUnmount(() => {
  audioEl.value?.pause()
})

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const whole = Math.floor(seconds)
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}
</script>

<template>
  <div class="rounded-xl border border-white/10 bg-white/5 px-3.5 py-3">
    <!-- 无音源 -->
    <div v-if="!hasSource" class="flex items-center gap-2.5 text-slate-400">
      <Music :size="14" aria-hidden="true" />
      <p class="text-[11.5px]">音频正在上传中</p>
    </div>

    <div v-else class="flex items-center gap-3">
      <button
        type="button"
        class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-[#3d1d05] shadow-glow transition active:scale-95 disabled:opacity-50"
        :aria-label="playing ? '暂停' : '播放'"
        :aria-pressed="playing"
        :disabled="failed"
        @click="toggle"
      >
        <Loader2 v-if="loading" :size="14" class="animate-spin" aria-hidden="true" />
        <Pause v-else-if="playing" :size="13" fill="currentColor" aria-hidden="true" />
        <Play v-else :size="13" fill="currentColor" class="translate-x-[1px]" aria-hidden="true" />
      </button>

      <div class="min-w-0 flex-1">
        <input
          type="range"
          min="0"
          :max="Math.max(total, 0.1)"
          step="0.1"
          :value="current"
          class="dream-range"
          :style="{ background: `linear-gradient(to right, #ff8a1c ${percent}%, rgba(255,255,255,0.14) ${percent}%)` }"
          :aria-label="`播放进度，共 ${formatTime(total)}`"
          :disabled="failed"
          @input="onSeek"
        />

        <div class="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-slate-500">
          <span class="truncate">{{ title || '试听' }}</span>
          <span class="shrink-0 tabular-nums">{{ formatTime(current) }} / {{ formatTime(total) }}</span>
        </div>
      </div>
    </div>

    <p v-if="failed" class="mt-1.5 text-[10px] text-rose-300">音频暂时无法播放</p>

    <audio
      ref="audioEl"
      :src="src || undefined"
      preload="metadata"
      @loadedmetadata="onLoaded"
      @canplay="loading = false"
      @timeupdate="onTimeUpdate"
      @play="playing = true"
      @pause="playing = false"
      @waiting="loading = true"
      @playing="loading = false"
      @ended="onEnded"
      @error="onError"
    />
  </div>
</template>
