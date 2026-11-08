<script setup lang="ts">
/**
 * AI 造梦事务所 · 空状态
 *
 * 用研小鸿（社团吉祥物）打个招呼，替代冷冰冰的空框；
 * 不铺卡片、不用渐变占位图，保证「内容留空」时页面依然体面。
 */
import MascotPet from '@/components/MascotPet.vue'

withDefaults(
  defineProps<{
    title: string
    hint?: string
    /** 紧凑模式（嵌在其他区块里时用） */
    compact?: boolean
  }>(),
  { hint: '', compact: false },
)
</script>

<template>
  <div
    class="flex flex-col items-center text-center"
    :class="compact ? 'gap-2 py-10' : 'gap-2.5 py-14'"
  >
    <MascotPet :size="compact ? 84 : 112" class="animate-floaty" />

    <p class="text-[12.5px] font-medium text-slate-200">{{ title }}</p>
    <p v-if="hint" class="max-w-[16rem] text-[11px] leading-5 text-slate-500">{{ hint }}</p>

    <slot />
  </div>
</template>
