<script setup lang="ts">
/**
 * AI 造梦事务所 · 作品图片
 *
 * 画廊和详情页都按**原图比例完整展示**（不裁切），让作品本身成为视觉主体；
 * 只有榜单缩略图用方图裁切。
 *
 * 没有图片时显示一块深色底 + 「待补充作品图片」，
 * 不使用彩色渐变占位卡来冒充作品。
 */
import { computed, ref } from 'vue'
import { Image as ImageIcon, Music } from 'lucide-vue-next'
import { dreamCover } from '@/utils/dream'
import type { DreamWork } from '@/types/dream'

const props = withDefaults(
  defineProps<{
    work: DreamWork
    /** 首屏图片立即加载 */
    eager?: boolean
    /** 缩略图模式：方图裁切（榜单用） */
    thumb?: boolean
  }>(),
  { eager: false, thumb: false },
)

const src = computed(() => dreamCover(props.work))
/** 音乐作品没有封面时用音符，文案也不叫「作品图片」——音乐的主角是音频 */
const isMusic = computed(() => props.work.category === 'music')
const placeholderIcon = computed(() => (isMusic.value ? Music : ImageIcon))
const placeholderText = computed(() => (isMusic.value ? '封面待补充' : '待补充作品图片'))
const loaded = ref(false)
const failed = ref(false)
</script>

<template>
  <!-- 缩略图：方图裁切 -->
  <div v-if="thumb" class="relative aspect-square w-full overflow-hidden bg-white/5">
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      loading="lazy"
      decoding="async"
      draggable="false"
      @load="loaded = true"
      @error="failed = true"
    />
    <div v-else class="absolute inset-0 grid place-items-center text-slate-600">
      <component :is="placeholderIcon" :size="12" aria-hidden="true" />
    </div>
  </div>

  <!-- 画廊 / 详情：完整展示 -->
  <div v-else class="relative w-full bg-white/5" :class="loaded ? '' : 'min-h-[150px]'">
    <img
      v-if="src && !failed"
      :src="src"
      :alt="work.title"
      class="block w-full transition-opacity duration-500"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      draggable="false"
      @load="loaded = true"
      @error="failed = true"
    />

    <div
      v-if="!src || failed"
      class="flex min-h-[150px] w-full flex-col items-center justify-center gap-1.5 px-4 py-10 text-center"
    >
      <component :is="placeholderIcon" :size="15" class="text-slate-600" aria-hidden="true" />
      <p class="text-[9px] tracking-wide text-slate-500">{{ placeholderText }}</p>
    </div>
    <div v-else-if="!loaded" class="absolute inset-0 animate-pulse bg-white/5" aria-hidden="true" />
  </div>
</template>
