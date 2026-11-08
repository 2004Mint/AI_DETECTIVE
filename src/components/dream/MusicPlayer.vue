<script setup lang="ts">
/**
 * AI 造梦事务所 · 黑胶唱片播放器
 *
 * 音乐作品的详情页就是一张「正在播放」的唱片：
 * 唱片转、唱臂落、进度条和上一首 / 播放 / 下一首。
 *
 * 几个刻意的细节：
 * 1. 暂停是用 `animation-play-state: paused`，唱片停在原来的角度，不会跳回 0 度；
 * 2. 唱臂在暂停时抬起（转到盘外），播放时落到盘面，0.6s 缓动；
 * 3. 一首放完自动接下一首（最后一首放完就停在结尾）；
 * 4. 上一首 / 下一首沿用画廊的分类顺序，切歌后继续播放；
 * 5. 仍然只用原生 `<audio>`，不引入播放器依赖。
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Loader2, Music2, Pause, Play, SkipBack, SkipForward } from 'lucide-vue-next'
import { dreamCategoryOf } from '@/data/dream/categories'
import { creatorOf, dreamAudio, dreamCover } from '@/utils/dream'
import type { DreamWork } from '@/types/dream'

const props = defineProps<{
  work: DreamWork
  /** 同分类作品（画廊顺序），用来算上一首 / 下一首 */
  tracks: readonly DreamWork[]
}>()

const emit = defineEmits<{ select: [id: string] }>()

const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const loading = ref(false)
const failed = ref(false)
const current = ref(0)
const total = ref(props.work.duration ?? 0)

const src = computed(() => dreamAudio(props.work))
const cover = computed(() => dreamCover(props.work))
const hasSource = computed(() => Boolean(src.value))
const category = computed(() => dreamCategoryOf(props.work.category))

const index = computed(() => props.tracks.findIndex((track) => track.id === props.work.id))
const prevTrack = computed(() => (index.value > 0 ? props.tracks[index.value - 1] : null))
const nextTrack = computed(() =>
  index.value >= 0 && index.value < props.tracks.length - 1 ? props.tracks[index.value + 1] : null,
)

const percent = computed(() =>
  total.value > 0 ? Math.min(100, Math.max(0, (current.value / total.value) * 100)) : 0,
)

/** 切歌后是否接着播（点「下一首」/ 自动接歌时为 true） */
let resumeOnChange = false

async function start() {
  const el = audioEl.value
  if (!el || !hasSource.value) return
  loading.value = true
  try {
    await el.play()
  } catch (error) {
    loading.value = false
    playing.value = false
    // 被浏览器的自动播放策略拦下（NotAllowedError）不算文件坏了：等用户再点一次就能放
    const name = error instanceof Error ? error.name : ''
    if (name !== 'NotAllowedError' && name !== 'AbortError') failed.value = true
  }
}

function toggle() {
  const el = audioEl.value
  if (!el || !hasSource.value) return
  if (el.paused) void start()
  else el.pause()
}

function go(track: DreamWork | null, resume: boolean) {
  if (!track || track.id === props.work.id) return
  resumeOnChange = resume
  emit('select', track.id)
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
  if (nextTrack.value) {
    go(nextTrack.value, true)
    return
  }
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
  () => props.work.id,
  async () => {
    const el = audioEl.value
    playing.value = false
    loading.value = false
    failed.value = false
    current.value = 0
    total.value = props.work.duration ?? 0
    if (!el) return
    el.load()
    if (resumeOnChange) {
      resumeOnChange = false
      await nextTick()
      void start()
    }
  },
  { flush: 'post' },
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
  <section class="mx-auto w-full max-w-md">
    <!-- 没有音源：不假装能播 -->
    <div v-if="!hasSource" class="glass flex items-center justify-center gap-2.5 py-14 text-slate-400">
      <Music2 :size="15" aria-hidden="true" />
      <p class="text-[12px]">音频正在上传中</p>
    </div>

    <template v-else>
      <!-- 唱片 -->
      <div class="record-stage">
        <div class="record" :class="{ 'is-spinning': playing }">
          <div class="record-grooves" aria-hidden="true" />
          <div class="record-label">
            <img v-if="cover" :src="cover" alt="" draggable="false" />
            <div v-else class="record-label-empty">
              <Music2 :size="20" aria-hidden="true" />
            </div>
          </div>
          <span class="record-hole" aria-hidden="true" />
        </div>

        <div class="record-sheen" aria-hidden="true" />

        <!-- 唱臂：暂停抬起 / 播放落针 -->
        <div class="tonearm" :class="{ 'is-down': playing }" aria-hidden="true">
          <span class="tonearm-pivot" />
          <span class="tonearm-arm" />
          <span class="tonearm-head" />
        </div>
      </div>

      <!-- 曲目信息 -->
      <h1 class="mt-8 text-center text-[21px] font-bold leading-snug tracking-tight text-white">
        {{ work.title }}
      </h1>
      <p class="mt-1.5 flex flex-wrap items-center justify-center gap-x-1.5 text-[11px] text-slate-400">
        <span class="text-brand-light">{{ category?.label ?? 'AI 音乐创作' }}</span>
        <template v-if="work.tool">
          <span class="text-slate-700" aria-hidden="true">·</span>
          <span>{{ work.tool }}</span>
        </template>
        <span class="text-slate-700" aria-hidden="true">·</span>
        <span>{{ creatorOf(work) }}</span>
      </p>

      <!-- 进度 -->
      <div class="mt-6">
        <input
          type="range"
          min="0"
          :max="Math.max(total, 0.1)"
          step="0.1"
          :value="current"
          class="dream-range dream-range-lg"
          :style="{
            background: `linear-gradient(to right, #ff8a1c ${percent}%, rgba(255,255,255,0.14) ${percent}%)`,
          }"
          :aria-label="`播放进度，共 ${formatTime(total)}`"
          :disabled="failed"
          @input="onSeek"
        />

        <div class="mt-2 flex items-center justify-between text-[10px] tabular-nums text-slate-500">
          <span>{{ formatTime(current) }}</span>
          <span>{{ formatTime(total) }}</span>
        </div>
      </div>

      <!-- 控制 -->
      <div class="mt-5 flex items-center justify-center gap-5">
        <button
          type="button"
          class="music-btn"
          :disabled="!prevTrack"
          :aria-label="prevTrack ? `上一首：${prevTrack.title}` : '已经是第一首'"
          @click="go(prevTrack, playing)"
        >
          <SkipBack :size="15" fill="currentColor" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="music-btn music-play"
          :aria-label="playing ? '暂停' : '播放'"
          :aria-pressed="playing"
          :disabled="failed"
          @click="toggle"
        >
          <Loader2 v-if="loading" :size="19" class="animate-spin" aria-hidden="true" />
          <Pause v-else-if="playing" :size="18" fill="currentColor" aria-hidden="true" />
          <Play v-else :size="18" fill="currentColor" class="translate-x-[1px]" aria-hidden="true" />
        </button>

        <button
          type="button"
          class="music-btn"
          :disabled="!nextTrack"
          :aria-label="nextTrack ? `下一首：${nextTrack.title}` : '已经是最后一首'"
          @click="go(nextTrack, playing)"
        >
          <SkipForward :size="15" fill="currentColor" aria-hidden="true" />
        </button>
      </div>

      <p v-if="failed" class="mt-3 text-center text-[10.5px] text-rose-300">
        音频暂时无法播放，稍后再试试
      </p>
    </template>

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
  </section>
</template>
