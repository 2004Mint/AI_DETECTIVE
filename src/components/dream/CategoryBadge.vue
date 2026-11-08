<script setup lang="ts">
/**
 * AI 造梦事务所 · 封面分类徽标
 *
 * 压在作品封面左上角的小容器，标出这件作品属于哪个分类。
 * 底色 = 分类色（16%）+ 深可可（66%），所以压在任何图片上都读得清；
 * 小屏只写「视觉」「音乐」这类两字短名，大屏补回「AI」前缀。
 *
 * 分类取不到时不渲染（数据出错时宁可少一个徽标，也不显示「未分类」）。
 */
import { computed } from 'vue'
import { dreamCategoryOf } from '@/data/dream/categories'

const props = withDefaults(
  defineProps<{
    /** 分类键，例如 `visual` */
    category: string
    /** sm = 瀑布流卡片，md = 详情页大图 */
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' },
)

const meta = computed(() => dreamCategoryOf(props.category))
</script>

<template>
  <span
    v-if="meta"
    class="dream-badge"
    :class="size === 'md' ? 'dream-badge-md' : ''"
    :style="{ '--cat': meta.accent }"
  >
    <component :is="meta.icon" :size="size === 'md' ? 10 : 9" aria-hidden="true" />
    <span class="sm:hidden">{{ meta.mini }}</span>
    <span class="hidden sm:inline">{{ meta.short }}</span>
  </span>
</template>
