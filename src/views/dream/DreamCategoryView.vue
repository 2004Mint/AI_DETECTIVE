<script setup lang="ts">
/**
 * AI 造梦事务所 · 分类页
 *
 * 首页已经支持就地筛选，这个页面只服务深链（二维码 / 旧链接）：
 * 保持同一套画廊样式，不做第二套布局。
 */
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import DreamShell from '@/components/dream/DreamShell.vue'
import WorkGallery from '@/components/dream/WorkGallery.vue'
import EmptyState from '@/components/dream/EmptyState.vue'
import { dreamCategoryOf } from '@/data/dream/categories'
import { allWorks, newestWorks, worksIn } from '@/utils/dream'

const route = useRoute()

const raw = computed(() => String(route.params.category ?? 'all'))
const isAll = computed(() => raw.value === 'all')
const category = computed(() => (isAll.value ? undefined : dreamCategoryOf(raw.value)))
const notFound = computed(() => !isAll.value && !category.value)

const works = computed(() => {
  if (isAll.value) return newestWorks(allWorks())
  return category.value ? worksIn(category.value.key) : []
})
</script>

<template>
  <DreamShell>
    <div class="pt-5">
      <RouterLink to="/dream-studio" class="dream-link">返回画廊</RouterLink>
    </div>

    <template v-if="notFound">
      <EmptyState class="mt-12" title="没有这个分类" hint="链接可能过期了，回首页看看吧。" />
    </template>

    <template v-else>
      <header class="mt-5" v-reveal="0">
        <h1 class="text-[24px] font-bold tracking-tight text-white">
          {{ isAll ? '全部作品' : category?.label }}
        </h1>
        <p class="mt-1 text-[11px] text-slate-500">{{ works.length }} 件作品</p>
      </header>

      <div class="mt-3" v-reveal="90">
        <WorkGallery
          :works="works"
          :empty-title="isAll ? '作品正在布展中' : '这个分类还没有作品'"
          empty-hint="先去其他分类逛逛吧。"
        />
      </div>
    </template>
  </DreamShell>
</template>
