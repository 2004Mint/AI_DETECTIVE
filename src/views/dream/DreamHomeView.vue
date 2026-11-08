<script setup lang="ts">
/**
 * AI 造梦事务所 · 首页
 *
 * 只有四块：品牌区、分类栏、当前分类说明、作品画廊（排行榜入口在顶部导航）。
 *
 * 分类栏做成「图标 + 数量 + 分类色选中态」的分段控件，
 * 切换在本地过滤、不跳页；说明文字跟着选中项一起变，让人一眼知道这一栏是什么。
 */
import { computed, ref } from 'vue'
import DreamShell from '@/components/dream/DreamShell.vue'
import CategoryRail from '@/components/dream/CategoryRail.vue'
import CategoryIntro from '@/components/dream/CategoryIntro.vue'
import WorkGallery from '@/components/dream/WorkGallery.vue'
import { DREAM_SITE } from '@/data/dream/site'
import { allWorks, newestWorks } from '@/utils/dream'
import type { DreamCategoryFilter } from '@/types/dream'

const works = computed(() => newestWorks(allWorks()))
const active = ref<DreamCategoryFilter>('all')

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

    <!-- 2. 分类栏（滚动时吸附在顶栏下） -->
    <div class="dream-railbar mt-4">
      <div class="dream-railbar-inner">
        <CategoryRail v-model="active" />
      </div>
    </div>

    <!-- 3. 当前分类说明 -->
    <CategoryIntro :category="active" link class="mt-3.5" v-reveal="60" />

    <!-- 4. 作品画廊 -->
    <section class="mt-4" v-reveal="120">
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
