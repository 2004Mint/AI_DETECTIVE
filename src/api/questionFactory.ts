/**
 * 素材组合 → 题目（纯函数）
 *
 * 独立成文件的原因：这里不依赖 Vite 的 `import.meta.glob`，
 * 因此自检脚本（`scripts/check-rounds.ts`）可以用**真实素材**直接加载本文件，
 * 验证最终组装出来的题目（题材标签 / 题号 / 答案侧 / 文案）是否符合预期，
 * 而不是只验证抽题算法。
 *
 * ⚠️ 为了让 Node 能直接加载（`node --experimental-strip-types`），
 * 本文件与 `utils/roundBuilder.ts`、`utils/random.ts`、`utils/assetName.ts`
 * 一样使用**相对路径 + .ts 扩展名**引用模块，请不要改成 `@/` 别名。
 */
import { copyForCategory, MASCOT_HINTS } from '../data/question-copy.ts'
import type { Question, QuestionImage, Side } from '../types/game.ts'
import { pickOne } from '../utils/random.ts'
import type { RandomFn } from '../utils/random.ts'
import type { RoundPair } from '../utils/roundBuilder.ts'

/** 组装题目所需的最小素材信息 */
export interface AssetRef {
  /** 打包后的图片 URL */
  url: string
  /** 所属题材在题材表中的序号（用于生成题号） */
  categoryRank: number
  /** 在该题材内的序号（用于生成题号） */
  slot: number
}

/**
 * 题号 = 题材序号 × 10000 + AI 图序号 × 100 + 真实图序号 + 1
 *
 * 同一个 (题材, AI 图, 真实图) 组合的题号恒定且全局唯一，
 * 便于做题记录与线上排查（前提：单个题材内素材不超过 99 张）。
 */
export function comboId(ai: AssetRef, real: AssetRef): number {
  return ai.categoryRank * 10000 + ai.slot * 100 + real.slot + 1
}

/**
 * 把一组素材配对组装成一道完整题目。
 * @param pair 同题材的一组 (AI 图, 真实图)
 * @param aiSide AI 图放在 A 还是 B（由 `roundBuilder.planAiSides` 规划）
 * @param random 可注入随机源（用于挑文案，测试用）
 */
export function toQuestion(
  pair: RoundPair<AssetRef, AssetRef>,
  aiSide: Side,
  random: RandomFn = Math.random,
): Question {
  const copy = copyForCategory(pair.categoryKey)
  const aiImage: QuestionImage = { url: pair.ai.url, type: 'ai' }
  const realImage: QuestionImage = { url: pair.real.url, type: 'real' }

  return {
    id: comboId(pair.ai, pair.real),
    title: pickOne(copy.titles, random) ?? '哪一张是 AI 生成的？',
    category: copy.label,
    realLabel: copy.realLabel,
    imageA: aiSide === 'A' ? aiImage : realImage,
    imageB: aiSide === 'A' ? realImage : aiImage,
    answer: aiSide,
    explanation: pickOne(copy.explanations, random) ?? '',
    // 研小鸿贴士取全局通用文案池：不涉及具体画面内容，随机抽到任何图片都成立
    aiHint: pickOne(MASCOT_HINTS, random) ?? '',
  }
}
