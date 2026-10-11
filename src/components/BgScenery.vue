<script setup lang="ts">
/**
 * 全局背景装饰：渐变底色 + 光晕 + 闪烁星星
 * 纯视觉元素，fixed 铺满但 pointer-events-none，不干扰交互。
 */

interface Star {
  id: number
  left: string
  top: string
  size: number
  delay: number
  duration: number
  opacity: number
}

/** 用确定性的公式生成星星位置，避免每次渲染跳动 */
const STARS: Star[] = Array.from({ length: 36 }, (_, i) => {
  const n = i * 31 + 7
  return {
    id: i,
    left: `${((n * 13) % 97) + 1}%`,
    top: `${((n * 29 + 11) % 94) + 2}%`,
    size: (i % 3) + 1,
    delay: (i * 0.37) % 2.4,
    duration: 2 + (i % 5) * 0.45,
    opacity: 0.3 + (i % 4) * 0.18,
  }
})
</script>

<template>
  <div aria-hidden="true" class="pointer-events-none fixed inset-0 overflow-hidden">
    <!-- 底色 -->
    <div class="bg-stage absolute inset-0" />

    <!-- 三个缓慢漂浮的彩色光晕（全部暖色，避免青/绿叠底发灰绿） -->
    <div class="animate-floaty-slow absolute -left-32 -top-40 h-[26rem] w-[26rem] rounded-full bg-brand/20 blur-[110px]" />
    <div
      class="animate-floaty-slow absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px] [animation-delay:-2s]"
    />
    <div
      class="animate-floaty-slow absolute -bottom-32 left-1/5 h-96 w-96 rounded-full bg-rose-400/10 blur-[120px] [animation-delay:-4s]"
    />

    <!-- 星星 -->
    <div class="absolute inset-0">
      <span
        v-for="s in STARS"
        :key="s.id"
        class="animate-twinkle absolute rounded-full bg-white"
        :style="{
          left: s.left,
          top: s.top,
          width: `${s.size}px`,
          height: `${s.size}px`,
          opacity: s.opacity,
          animationDelay: `${s.delay}s`,
          animationDuration: `${s.duration}s`,
        }"
      />
    </div>
  </div>
</template>
