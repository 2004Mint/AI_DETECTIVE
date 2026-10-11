<script lang="ts">
/**
 * 场景情绪 → 表情帧号 的集中映射（帧号与精灵图行优先顺序一致）：
 *   0 你好！  1 太棒了！  2 ？  3 赞！
 *   4 哈哈哈~ 5 ！！     6 呜...  7 zzz
 *   8 哼！    9 嘿嘿~   10 呜呜... 11 再见~
 * 若美术侧格子顺序调整，只需修改这里的帧号即可全局生效。
 */
export const MASCOT_MOOD = {
  /** 提问 / 引导提示：歪头思考「？」 */
  hint: 2,
  /** 答对：太棒了！ */
  correct: 1,
  /** 答错：呜呜... */
  wrong: 10,
  /** 问候（默认） */
  hello: 0,
} as const

/**
 * 结算页情绪：按答对题数挑选表情
 * 10 → 太棒了！/ 8~9 → 赞！/ 6~7 → 哈哈哈~ / 3~5 → 嘿嘿~ / 0~2 → 呜...(共情安慰)
 */
export function mascotFrameForScore(correct: number): number {
  if (correct >= 10) return 1
  if (correct >= 8) return 3
  if (correct >= 6) return 4
  if (correct >= 3) return 9
  return 6
}
</script>

<script setup lang="ts">
/**
 * 社团吉祥物「研小鸿」表情形象（来自美术提供的表情精灵图，按行优先切成 12 帧）
 *
 * 表情序号映射（帧 0~11，与精灵图左上→右下的行优先顺序一致）：
 *   0 你好！  1 太棒了！  2 ？  3 赞！
 *   4 哈哈哈~ 5 ！！     6 呜...  7 zzz
 *   8 哼！    9 嘿嘿~   10 呜呜... 11 再见~
 *
 * 场景联动：提示/答对/答错/结算 的情绪由 MASCOT_MOOD / mascotFrameForScore 统一提供
 * （见上方普通 script 块），各调用点只需传 emotion；若美术侧格子顺序有变，
 * 重跑 scripts/crop-mascot.ps1 后调整映射帧号即可。
 */
import { computed } from 'vue'

/**
 * 帧资源：运行时按需加载，只有用到的表情才会被浏览器下载。
 *
 * ⚠️ 帧文件已统一压成 WebP（见 scripts/optimize-images.mjs）；
 *    若重跑 scripts/crop-mascot.ps1 裁出新帧（PNG），需再执行一次 `npm run optimize:images`。
 */
const frameModules = import.meta.glob<string>('/src/assets/images/pet/frames/frame-*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
})
const FRAMES: ReadonlyArray<string> = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key])

/** 表情贴纸文案（仅用于 alt / aria 描述） */
const EMOTION_TEXT = [
  '你好！',
  '太棒了！',
  '？',
  '赞！',
  '哈哈哈~',
  '！！',
  '呜...',
  'zzz',
  '哼！',
  '嘿嘿~',
  '呜呜...',
  '再见~',
] as const

const props = withDefaults(
  defineProps<{
    /** 显示尺寸(px)，正方形 */
    size?: number
    /** 表情帧序号：0~11，越界自动收拢到最近合法值 */
    emotion?: number
  }>(),
  { size: 132, emotion: 0 },
)

const frameIndex = computed(() => Math.min(11, Math.max(0, Math.round(props.emotion))))
const altText = computed(() => `研小鸿：${EMOTION_TEXT[frameIndex.value]}`)
</script>

<template>
  <img
    :src="FRAMES[frameIndex]"
    :width="size"
    :height="size"
    :alt="altText"
    class="select-none"
    draggable="false"
    decoding="async"
  />
</template>
