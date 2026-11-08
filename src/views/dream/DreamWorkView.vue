<script setup lang="ts">
/**
 * AI 造梦事务所 · 作品详情
 *
 * 只保留：大图（或音乐试听）、名称、分类、简介、工具、Prompt、投票。
 * 没有评论区、没有推荐位、没有标签墙。
 */
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import DreamShell from '@/components/dream/DreamShell.vue'
import WorkCover from '@/components/dream/WorkCover.vue'
import AudioPlayer from '@/components/dream/AudioPlayer.vue'
import PromptCard from '@/components/dream/PromptCard.vue'
import VoteButton from '@/components/dream/VoteButton.vue'
import DreamLightbox from '@/components/dream/DreamLightbox.vue'
import EmptyState from '@/components/dream/EmptyState.vue'
import { dreamCategoryOf } from '@/data/dream/categories'
import { creatorOf, dreamAudio, dreamCover, findWork, mediaOf } from '@/utils/dream'

const route = useRoute()
const router = useRouter()

const work = computed(() => findWork(String(route.params.id ?? '')))
const category = computed(() => dreamCategoryOf(work.value?.category))
const media = computed(() => (work.value ? mediaOf(work.value) : 'image'))
const cover = computed(() => (work.value ? dreamCover(work.value) : ''))
const audio = computed(() => (work.value ? dreamAudio(work.value) : ''))

const zooming = ref(false)

function openZoom() {
  if (cover.value) zooming.value = true
}

function goBack() {
  // 直接从二维码/分享链接进来时没有上一页，回画廊兜底
  if (window.history.length > 1) router.back()
  else void router.push('/dream-studio')
}

watch(
  work,
  (value) => {
    document.title = value ? `${value.title} · AI 造梦事务所` : '没有找到作品 · AI 造梦事务所'
  },
  { immediate: true },
)
</script>

<template>
  <DreamShell>
    <template v-if="work && category">
      <div class="pt-5">
        <button type="button" class="dream-link" @click="goBack">返回画廊</button>
      </div>

      <article class="mx-auto mt-4 max-w-2xl">
        <!-- 作品媒体 -->
        <template v-if="media === 'audio'">
          <div v-if="cover" class="overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10">
            <WorkCover :work="work" thumb eager />
          </div>
          <div :class="cover ? 'mt-3' : ''">
            <AudioPlayer :src="audio" :title="work.title" :duration="work.duration" />
          </div>
        </template>

        <template v-else-if="media === 'text'">
          <div class="rounded-2xl border border-white/10 bg-white/5 px-5 py-6">
            <p
              v-if="work.body"
              class="dream-serif whitespace-pre-wrap break-words text-[14px] leading-8 text-slate-200"
            >
              {{ work.body }}
            </p>
            <p v-else class="text-[12px] leading-6 text-slate-500">正文待补充。</p>
          </div>
        </template>

        <template v-else>
          <button
            type="button"
            class="block w-full overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
            :aria-label="`放大查看《${work.title}》`"
            @click="openZoom"
          >
            <WorkCover :work="work" eager />
          </button>
        </template>

        <!-- 作品信息 -->
        <div class="mt-5" v-reveal="120">
          <p class="text-[10.5px] font-semibold tracking-[0.04em] text-brand-light">
            {{ category.label }}
          </p>

          <h1 class="mt-1.5 text-[22px] font-bold leading-snug tracking-tight text-white">
            {{ work.title }}
          </h1>

          <p v-if="work.description" class="mt-3 text-[13px] leading-7 text-slate-300">
            {{ work.description }}
          </p>

          <p class="mt-3 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-400">
            <span v-if="work.tool">{{ work.tool }}</span>
            <span v-if="work.tool" class="text-slate-700" aria-hidden="true">·</span>
            <span>{{ creatorOf(work) }}</span>
          </p>

          <div class="mt-6">
            <VoteButton :work="work" />
          </div>

          <div class="mt-8" v-reveal="200">
            <PromptCard :prompt="work.prompt" />
          </div>
        </div>
      </article>

      <DreamLightbox :visible="zooming" :src="cover" :alt="work.title" @close="zooming = false" />
    </template>

    <EmptyState
      v-else
      class="mt-12"
      title="没有找到这件作品"
      hint="链接可能已经过期，或者作品已经撤展。"
    >
      <RouterLink to="/dream-studio" class="dream-btn dream-btn-quiet mt-3">回到画廊</RouterLink>
    </EmptyState>
  </DreamShell>
</template>
