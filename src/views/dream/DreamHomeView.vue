<script setup lang="ts">
/**
 * AI 造梦事务所 · 首页
 *
 * 只有四块：品牌区、分类胶囊、作品画廊、排行榜入口（顶部导航）。
 * 分类切换在本地过滤，不跳页；画廊用两列瀑布流，图片完整展示。
 */
import { computed, ref } from 'vue'
import DreamShell from '@/components/dream/DreamShell.vue'
import FilterTabs from '@/components/dream/FilterTabs.vue'
import WorkGallery from '@/components/dream/WorkGallery.vue'
import { DREAM_CATEGORIES } from '@/data/dream/categories'
import { DREAM_SITE } from '@/data/dream/site'
import { allWorks, newestWorks } from '@/utils/dream'
import type { DreamCategoryKey } from '@/types/dream'

/** 分类胶囊：全部 + 四个分类短名 */
const FILTERS = [
  { key: 'all' as const, label: '全部' },
  ...DREAM_CATEGORIES.map((category) => ({ key: category.key, label: category.short })),
]

const works = computed(() => newestWorks(allWorks()))
const active = ref<DreamCategoryKey | 'all'>('all')

const listed = computed(() =>
  active.value === 'all'
    ? works.value
    : works.value.filter((work) => work.category === active.value),
)

const emptyTitle = computed(() =>
  active.value === 'all' ? '作品正在布展中' : '这个分类还没有作品',
)
</script>

<template>
  <DreamShell>
    <!-- 1. 品牌区 -->
    <section class="pt-7 sm:pt-10" v-reveal="0">
      <h1 class="text-[28px] font-black leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
        {{ DREAM_SITE.title }}
      </h1>
      <p class="mt-2 text-[12.5px] leading-6 text-slate-400">
        {{ DREAM_SITE.subtitle }}
      </p>
    </section>

    <!-- 2. 分类导航（滚动时吸附在顶栏下） -->
    <nav class="sticky top-14 z-20 -mx-5 mt-5 bg-night/80 px-5 py-2 backdrop-blur-xl">
      <FilterTabs v-model="active" :options="FILTERS" />
    </nav>

    <!-- 3. 作品画廊 -->
    <section class="mt-2" v-reveal="90">
      <Transition name="dream-fade" mode="out-in">
        <div :key="active">
          <WorkGallery
            :works="listed"
            :empty-title="emptyTitle"
            empty-hint="先看看其他分类，或者稍后再来。"
          />
        </div>
      </Transition>
    </section>
  </DreamShell>
</template>
