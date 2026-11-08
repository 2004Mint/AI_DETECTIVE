<script setup lang="ts">
/**
 * AI 造梦事务所 · 分类栏
 *
 * 解决「分类栏看不出区别」的问题，做了三件事：
 * 1. 每项都有图标：画面 / 笔 / 音符 / 星光，不看文字也能分辨；
 * 2. 每项带作品数量，点之前就知道里面有多少东西；
 * 3. 选中态用分类色（低透明度）铺底 + 描边，和封面徽标、榜单圆点是同一套色标。
 *
 * 首页就地筛选，分类页用来换分类；手机上整条可横向滑动，选中项自动滚进视野。
 */
import { computed, onMounted, ref, watch } from 'vue'
import { LayoutGrid } from 'lucide-vue-next'
import { DREAM_ALL_ACCENT, DREAM_CATEGORIES } from '@/data/dream/categories'
import { categoryCounts } from '@/utils/dream'
import type { DreamCategoryFilter } from '@/types/dream'

const props = defineProps<{
  modelValue: DreamCategoryFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DreamCategoryFilter]
}>()

const counts = categoryCounts()
const total = DREAM_CATEGORIES.reduce((sum, category) => sum + counts[category.key], 0)

const options = computed(() => [
  {
    key: 'all' as const,
    label: '全部',
    mini: '全部',
    icon: LayoutGrid,
    accent: DREAM_ALL_ACCENT,
    count: total,
  },
  ...DREAM_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.short,
    mini: category.mini,
    icon: category.icon,
    accent: category.accent,
    count: counts[category.key],
  })),
])

const railEl = ref<HTMLElement | null>(null)

/** 手机上把选中项滚到中间，避免点了右边的项之后看不见自己选了什么 */
function revealActive() {
  const rail = railEl.value
  if (!rail) return
  const active = rail.querySelector<HTMLElement>('[data-active="true"]')
  if (!active) return
  if (rail.scrollWidth <= rail.clientWidth) return
  const left = active.offsetLeft - (rail.clientWidth - active.offsetWidth) / 2
  rail.scrollTo({ left: Math.max(0, left), behavior: 'smooth' })
}

watch(() => props.modelValue, revealActive, { flush: 'post' })
onMounted(revealActive)
</script>

<template>
  <div
    ref="railEl"
    class="dream-rail dream-scroll-x"
    role="group"
    aria-label="作品分类"
  >
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="dream-rail-item"
      :class="modelValue === option.key ? 'is-active' : ''"
      :style="{ '--cat': option.accent }"
      :data-active="modelValue === option.key"
      :aria-pressed="modelValue === option.key"
      @click="emit('update:modelValue', option.key)"
    >
      <component :is="option.icon" :size="12" aria-hidden="true" />
      <span class="dream-rail-label">
        <span class="sm:hidden">{{ option.mini }}</span>
        <span class="hidden sm:inline">{{ option.label }}</span>
      </span>
      <span class="dream-rail-count">{{ option.count }}</span>
    </button>
  </div>
</template>
