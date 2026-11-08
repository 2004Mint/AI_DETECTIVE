<script setup lang="ts">
/**
 * AI 造梦事务所 · 分类页
 *
 * 首页已经支持就地筛选，这个页面只服务深链（二维码 / 旧链接 / 首页的「分类页」入口）：
 * 保持同一套画廊样式，标题区直接说明「这是什么分类、有多少件」。
 * 分类栏在这里改成「换分类就换页面」，其余体验和首页一致。
 */
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LayoutGrid } from 'lucide-vue-next'
import DreamShell from '@/components/dream/DreamShell.vue'
import BackToStudio from '@/components/dream/BackToStudio.vue'
import CategoryRail from '@/components/dream/CategoryRail.vue'
import WorkGallery from '@/components/dream/WorkGallery.vue'
import EmptyState from '@/components/dream/EmptyState.vue'
import { dreamCategoryOf } from '@/data/dream/categories'
import { allWorks, newestWorks, worksIn } from '@/utils/dream'
import type { DreamCategoryFilter } from '@/types/dream'

const route = useRoute()
const router = useRouter()

const raw = computed(() => String(route.params.category ?? 'all'))
const isAll = computed(() => raw.value === 'all')
const category = computed(() => (isAll.value ? undefined : dreamCategoryOf(raw.value)))
const notFound = computed(() => !isAll.value && !category.value)

const works = computed(() => {
  if (isAll.value) return newestWorks(allWorks())
  return category.value ? worksIn(category.value.key) : []
})

const activeKey = computed<DreamCategoryFilter>(() =>
  category.value?.key ?? 'all',
)

/** 分类栏在这里不就地过滤，而是换到对应分类的路由 */
function goTo(key: DreamCategoryFilter) {
  if (key === 'all') void router.push('/dream-studio')
  else if (key !== category.value?.key) void router.push(`/dream-studio/category/${key}`)
}
</script>

<template>
  <DreamShell>
    <div class="pt-5">
      <BackToStudio />
    </div>

    <template v-if="notFound">
      <EmptyState class="mt-12" title="没有这个分类" hint="链接可能过期了，回首页看看吧。" />
    </template>

    <template v-else>
      <header
        class="mt-5 flex items-start gap-2.5"
        :style="{ '--cat': category?.accent ?? '#efe4d6' }"
        v-reveal="0"
      >
        <span class="dream-cat-chip mt-0.5" aria-hidden="true">
          <component :is="category?.icon ?? LayoutGrid" :size="14" />
        </span>

        <div class="min-w-0">
          <h1 class="text-[22px] font-bold leading-tight tracking-tight text-white">
            {{ isAll ? '全部作品' : category?.label }}
          </h1>
          <p class="mt-1 text-[10.5px] tabular-nums text-slate-500">{{ works.length }} 件作品</p>
          <p v-if="category" class="mt-1.5 text-[11.5px] leading-6 text-slate-400">
            {{ category.blurb }}
          </p>
        </div>
      </header>

      <div class="mt-4" v-reveal="60">
        <CategoryRail :model-value="activeKey" @update:model-value="goTo" />
      </div>

      <div class="mt-4" v-reveal="90">
        <WorkGallery
          :works="works"
          :empty-title="isAll ? '作品正在布展中' : '这个分类还没有作品'"
          empty-hint="先去其他分类逛逛吧。"
        />
      </div>
    </template>
  </DreamShell>
</template>
