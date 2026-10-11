/**
 * 一局抽题算法（纯函数，只依赖 ./random）
 *
 * 出题规则（对应玩法需求）：
 * 1. 「同一题材内各抽一张」：一道题 = 同一题材（animal / food / landscape / painting …）
 *    下随机抽 1 张 AI 图 + 1 张真实图，所以 A / B 两张图永远属于同一题材；
 * 2. 「出现过的题不再出现」：一局 10 题内，
 *    - 不会出现重复的 (题材, AI 图, 真实图) 组合；
 *    - 任何一张图片（AI 或真实）都不会被用到两次；
 * 3. 「题材尽量均分」：10 题按 4 个题材分，结果是 3 / 3 / 2 / 2（哪个题材多一题随机决定）。
 *
 * 本文件刻意不 import 任何工程模块（连类型都自带），
 * 以便用 `node --experimental-strip-types` 直接加载做批量自检（见 README「抽题自检」）。
 */
import { randomIndex, shuffle } from './random.ts'
import type { RandomFn } from './random.ts'

/** 一个题材的素材池：同题材下的全部 AI 图与真实图 */
export interface RoundCategory<TAI, TReal> {
  /** 题材键（由文件名解析，例如 animal / food / landscape / painting） */
  key: string
  /** 该题材的全部 AI 图 */
  ai: readonly TAI[]
  /** 该题材的全部真实图 */
  real: readonly TReal[]
}

/** 抽题结果：一道题的素材组合（还没决定谁放 A / B） */
export interface RoundPair<TAI, TReal> {
  categoryKey: string
  ai: TAI
  real: TReal
}

/**
 * 把 `total` 道题分配到各题材上，尽量均分且不超过各题材容量。
 *
 * 做法：每一轮都把「当前出题数最少且还有余量」的题材 +1（并列时随机挑一个），
 * 因此 4 个容量充足的题材分 10 题一定得到 3 / 3 / 2 / 2。
 * 若某题材素材不足，它的缺口会自动摊给其它题材；素材总数不够时按上限返回。
 *
 * @param capacities 各题材最多能出几题（= min(AI 图数, 真实图数)）
 * @param total 一局需要的题数（10）
 * @returns 与 capacities 等长的数组，第 i 项为第 i 个题材的出题数
 */
export function planCategoryCounts(
  capacities: readonly number[],
  total: number,
  random: RandomFn = Math.random,
): number[] {
  const cap = capacities.map((c) => Math.max(0, Math.floor(c)))
  const counts = cap.map(() => 0)
  const supply = cap.reduce((sum, c) => sum + c, 0)
  let remaining = Math.max(0, Math.min(Math.floor(total), supply))

  while (remaining > 0) {
    let lowest = Number.POSITIVE_INFINITY
    for (let i = 0; i < cap.length; i++) {
      if (counts[i] < cap[i] && counts[i] < lowest) lowest = counts[i]
    }
    if (lowest === Number.POSITIVE_INFINITY) break // 所有题材都用满了

    const candidates: number[] = []
    for (let i = 0; i < cap.length; i++) {
      if (counts[i] < cap[i] && counts[i] === lowest) candidates.push(i)
    }
    const chosen = randomIndex(candidates.length, random)
    if (chosen < 0) break
    counts[candidates[chosen]] += 1
    remaining -= 1
  }

  return counts
}

/**
 * 抽出一局的题材组合：返回 `total` 个不重复的 (题材, AI 图, 真实图) 组合。
 *
 * 保证「不重复」的两条关键性质：
 * - 同一题材内，AI 图与真实图各自独立洗牌后只取前 count 个：
 *   一张图在一个题材里最多被取一次 → 一局内同一张图片不会重复使用；
 * - 同一题材内每个 AI 图最多配一道题 → (题材, AI 图, 真实图) 组合不可能重复。
 *
 * 另外两组独立洗牌相当于随机匹配，因此同题材内的搭配组合是随机的，
 * 不会退化成「固定第 N 张配第 N 张」。
 */
export function buildRoundPairs<TAI, TReal>(
  categories: readonly RoundCategory<TAI, TReal>[],
  total: number,
  random: RandomFn = Math.random,
): RoundPair<TAI, TReal>[] {
  const capacities = categories.map((c) => Math.min(c.ai.length, c.real.length))
  const counts = planCategoryCounts(capacities, total, random)

  const pairs: RoundPair<TAI, TReal>[] = []
  categories.forEach((category, i) => {
    const count = counts[i]
    if (count <= 0) return

    // 独立洗牌后整段切片：既随机匹配，又保证图片不重复
    const ai = shuffle(category.ai, random).slice(0, count)
    const real = shuffle(category.real, random).slice(0, count)
    for (let k = 0; k < count; k++) {
      pairs.push({ categoryKey: category.key, ai: ai[k], real: real[k] })
    }
  })

  // 打乱题目顺序，避免同一题材的题扎堆出现
  return shuffle(pairs, random)
}

/**
 * 规划每道题里 AI 图放在哪一侧：总数尽量对半（10 题 = 5 个 A + 5 个 B），
 * 避免出现「连续 7 题答案都是 A」这类规律被玩家猜到。
 */
export function planAiSides(total: number, random: RandomFn = Math.random): Array<'A' | 'B'> {
  const sides: Array<'A' | 'B'> = []
  for (let i = 0; i < total; i++) sides.push(i % 2 === 0 ? 'A' : 'B')
  return shuffle(sides, random)
}
