<script setup lang="ts">
/**
 * AI 造梦事务所 · 分类胶囊
 *
 * 纯文字标签，当前项用白底轻阴影区分；手机上可横向滑动。
 * 选中后不跳页，直接切换画廊内容（由父组件过滤）。
 */
import type { DreamCategoryKey } from '@/types/dream'

defineProps<{
  modelValue: DreamCategoryKey | 'all'
  options: readonly { key: DreamCategoryKey | 'all'; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DreamCategoryKey | 'all']
}>()
</script>

<template>
  <div class="dream-scroll-x flex gap-1 overflow-x-auto">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="dream-tab"
      :class="modelValue === option.key ? 'dream-tab-active' : ''"
      :aria-pressed="modelValue === option.key"
      @click="emit('update:modelValue', option.key)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
