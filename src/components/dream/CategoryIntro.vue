<script setup lang="ts">
/**
 * AI 造梦事务所 · 当前分类说明
 *
 * 分类栏只给「短名 + 数量」，这里补上「你现在看的是哪一类、这类是什么、有多少件」，
 * 分类页还会多一个跳到该分类独立页面的入口。
 *
 * 「全部」时显示总数和排序规则，不编造文案。
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { LayoutGrid } from 'lucide-vue-next'
import { DREAM_ALL_ACCENT, DREAM_CATEGORIES, dreamCategoryOf } from '@/data/dream/categories'
import { categoryCounts } from '@/utils/dream'
import type { DreamCategoryFilter } from '@/types/dream'

const props = withDefaults(
  defineProps<{
    category: DreamCategoryFilter
    /** 显示「分类页」链接（首页用；分类页自己就是目标页，不显示） */
    link?: boolean
  }>(),
  { link: false },
)

const counts = categoryCounts()

const meta = computed(() => (props.category === 'all' ? null : dreamCategoryOf(props.category)))
const label = computed(() => meta.value?.label ?? '全部作品')
const icon = computed(() => meta.value?.icon ?? LayoutGrid)
const accent = computed(() => meta.value?.accent ?? DREAM_ALL_ACCENT)
const count = computed(() =>
  meta.value
    ? counts[meta.value.key]
    : DREAM_CATEGORIES.reduce((sum, category) => sum + counts[category.key], 0),
)
const hint = computed(() => meta.value?.blurb ?? '四个分类轮流展出，最新上传的作品排在最前面。')
</script>

<template>
  <div class="dream-intro" :style="{ '--cat': accent }">
    <span class="dream-cat-chip" aria-hidden="true">
      <component :is="icon" :size="13" />
    </span>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <p class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span class="text-[13px] font-semibold tracking-tight text-white">{{ label }}</span>
          <span class="text-[10.5px] tabular-nums text-slate-500">共 {{ count }} 件</span>
        </p>

        <RouterLink
          v-if="link && meta"
          :to="`/dream-studio/category/${meta.key}`"
          class="dream-intro-link"
        >
          分类页
        </RouterLink>
      </div>

      <p class="mt-1 text-[11px] leading-[1.65] text-slate-500">{{ hint }}</p>
    </div>
  </div>
</template>
