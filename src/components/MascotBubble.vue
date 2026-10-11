<script setup lang="ts">
/**
 * 研小鸿提示气泡：吉祥物表情 + 说话气泡，用于首页 / 游戏中 / 结算页的引导文案
 *
 * 尺寸说明：表情贴纸自带画面内容（含文字气泡），字号偏小，因此
 * sm ≈ 92px（游戏中/弹窗内嵌）、md ≈ 124px（结算页主评价）才看得清。
 */
import MascotPet from '@/components/MascotPet.vue'

withDefaults(
  defineProps<{
    /** 提示文字 */
    text: string
    /** 尺寸：sm=紧凑内嵌；md=常规 */
    size?: 'sm' | 'md'
    /** 是否带漂浮动画 */
    floaty?: boolean
    /** 气泡配色：light(白底深字，默认) / dark(玻璃底) */
    tone?: 'light' | 'dark'
    /** 研小鸿表情帧（0~11，见 MascotPet.vue 的映射注释） */
    emotion?: number
  }>(),
  { size: 'md', floaty: true, tone: 'light', emotion: 0 },
)

const PET_SIZE = { sm: 96, md: 120 } as const
</script>

<template>
  <div :class="['flex items-end gap-2', floaty && 'animate-floaty']">
    <MascotPet
      :size="PET_SIZE[size]"
      :emotion="emotion"
      class="shrink-0 drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]"
    />
    <div class="min-w-0">
      <p
        class="mb-0.5 text-[11px] font-bold tracking-widest"
        :class="tone === 'light' ? 'text-orange-300' : 'text-amber-300'"
      >
        研小鸿
      </p>
      <div
        class="relative max-w-[min(58vw,300px)] rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-[13px] leading-snug shadow-card"
        :class="tone === 'light' ? 'bg-[#fff6e6]/95 text-[#5a3a20]' : 'border border-amber-200/35 bg-gradient-to-br from-[#6b4126]/95 to-[#47280f]/95 text-[#ffe6c4]'"
      >
        <span
          aria-hidden="true"
          class="absolute -left-1.5 bottom-3 h-3 w-3 rotate-45"
          :class="tone === 'light' ? 'bg-[#fff6e6]/95' : 'bg-[#5a341c]/95'"
        />
        <p>{{ text }}</p>
      </div>
    </div>
  </div>
</template>
