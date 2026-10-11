/**
 * 题库访问层：按题材文件夹动态出题
 *
 * ## 素材约定
 * 图片放在 `src/assets/images/ai/` 与 `src/assets/images/real/`，文件名统一为
 * **`题材_序号.png`**（题材与序号之间用 `_` 或 `-`，扩展名任意）：
 *
 * ```
 * src/assets/images/ai/animal_1.png      src/assets/images/real/animal_1.jpg
 * src/assets/images/ai/food_3.png        src/assets/images/real/landscape_2.jpg
 * ```
 *
 * - 题材前缀相同的 AI 图与真实图组成一个「题材池」（animal / food / landscape / painting…）；
 * - **一道题的两张图一定来自同一题材**：同题材池里随机抽 1 张 AI 图 + 1 张真实图；
 * - 一局 10 题内不会重复出题，也不会重复使用同一张图片，题材尽量均分（3/3/2/2）
 *   —— 规则实现见 `utils/roundBuilder.ts`；
 * - 因此**加图 / 换图只要丢文件进文件夹就行**，不需要改任何代码；
 *   新增题材会自动出题（文案走兜底，可在 `data/question-copy.ts` 里补一份更贴切的）。
 */
import { copyForCategory } from '@/data/question-copy'
import type { Question } from '@/types/game'
import { parseAssetName } from '@/utils/assetName'
import type { RandomFn } from '@/utils/random'
import { buildRoundPairs, planAiSides } from '@/utils/roundBuilder'
import { TOTAL_ROUNDS } from '@/utils/scoring'
import type { AssetRef } from './questionFactory'
import { toQuestion } from './questionFactory'

/* ---------------- 1. 扫描素材 ---------------- */

const aiModules = import.meta.glob<string>(['/src/assets/images/ai/*', '/src/assets/images/ai/**/*'], {
  eager: true,
  query: '?url',
  import: 'default',
})

const realModules = import.meta.glob<string>(
  ['/src/assets/images/real/*', '/src/assets/images/real/**/*'],
  { eager: true, query: '?url', import: 'default' },
)

/** 扫描阶段读到的原始素材（还没排到题材里的位置） */
interface RawAsset {
  /** 素材令牌 = 无扩展名的文件名，例如 animal_1 */
  token: string
  /** 打包后的图片 URL */
  url: string
  /** 文件名里的序号，用于稳定排序 */
  order: number
}

/** 一张可出题的素材图 */
interface Asset extends AssetRef, RawAsset {
  /** 所属题材在题材表中的序号（用于生成稳定题号） */
  categoryRank: number
  /** 在该题材内的序号（用于生成稳定题号） */
  slot: number
}

/** 按题材分组；同题材内按序号排序，保证每次构建的 slot 稳定 */
function groupByCategory(modules: Record<string, string>, dir: string): Map<string, RawAsset[]> {
  const map = new Map<string, RawAsset[]>()
  const seen = new Set<string>()

  for (const [path, url] of Object.entries(modules)) {
    const parsed = parseAssetName(path)
    if (!parsed) {
      console.warn(
        `[题库] 跳过命名不符合「题材_序号」的素材：${path}` +
          `（请改成 ${dir}/animal_1.png 这样的名字）`,
      )
      continue
    }
    // 同一题材下同名不同扩展名（animal_1.png + animal_1.jpg）只能留一个，否则出题会撞图
    const dedupeKey = `${parsed.category}/${parsed.token}`
    if (seen.has(dedupeKey)) {
      console.warn(
        `[题库] 同一题材存在重名素材，已忽略后一个：${path}` +
          `（请只保留一个同名文件，例如只留 animal_1.png）`,
      )
      continue
    }
    seen.add(dedupeKey)

    const list = map.get(parsed.category) ?? []
    list.push({ token: parsed.token, url, order: parsed.order })
    map.set(parsed.category, list)
  }

  for (const list of map.values()) {
    list.sort((a, b) => a.order - b.order || a.token.localeCompare(b.token))
  }
  return map
}

/** 一个题材的素材池 */
interface Pool {
  key: string
  ai: Asset[]
  real: Asset[]
}

/** 组装全部题材池（题材键排序，保证题号稳定） */
function buildPools(): Pool[] {
  const aiMap = groupByCategory(aiModules, 'ai')
  const realMap = groupByCategory(realModules, 'real')
  const keys = [...new Set([...aiMap.keys(), ...realMap.keys()])].sort()

  return keys.map((key, rank) => {
    const ai: Asset[] = (aiMap.get(key) ?? []).map((asset) => ({
      ...asset,
      categoryRank: rank,
      slot: 0,
    }))
    const real: Asset[] = (realMap.get(key) ?? []).map((asset) => ({
      ...asset,
      categoryRank: rank,
      slot: 0,
    }))
    ai.forEach((asset, index) => {
      asset.slot = index
    })
    real.forEach((asset, index) => {
      asset.slot = index
    })

    if (ai.length === 0 || real.length === 0) {
      console.warn(
        `[题库] 题材「${key}」缺少${ai.length === 0 ? ' AI 图' : ''}${real.length === 0 ? ' 真实图' : ''}，` +
          `该题材本局不会出题（请同时放入 ai/${key}_1.png 与 real/${key}_1.jpg）`,
      )
    }
    return { key, ai, real }
  })
}

const POOLS: readonly Pool[] = buildPools()

/** 可用于出题的题材（AI 图与真实图都至少有 1 张） */
const USABLE_POOLS: readonly Pool[] = POOLS.filter((p) => p.ai.length > 0 && p.real.length > 0)

console.info(
  `[题库] 素材加载完成：${USABLE_POOLS.length} 个题材 ` +
    USABLE_POOLS.map((p) => `${p.key}(${p.ai.length}AI+${p.real.length}真实)`).join('、'),
)

/* ---------------- 2. 对外接口 ---------------- */

/**
 * 抽取一局 10 题：同题材内随机配对，局内不重复出题、不重复用图、题材尽量均分。
 * @param random 可注入随机源（测试用），默认 Math.random
 */
export function buildRoundQuestions(random: RandomFn = Math.random): Question[] {
  if (USABLE_POOLS.length === 0) {
    console.error(
      '[题库] 没有找到可用的图片素材：请把图片按「题材_序号」命名后分别放入 ' +
        'src/assets/images/ai/ 与 src/assets/images/real/',
    )
    return []
  }

  const pairs = buildRoundPairs(USABLE_POOLS, TOTAL_ROUNDS, random)
  const sides = planAiSides(pairs.length, random)
  return pairs.map((pair, index) => toQuestion(pair, sides[index] ?? 'A', random))
}

/** 素材库规模（供页面展示真实数字） */
export const POOL_STATS = {
  /** 可出题的题材数量 */
  categoryCount: USABLE_POOLS.length,
  /** 可出题的题材标签，例如 ['动物', '美食', '风景', '绘画'] */
  categoryLabels: USABLE_POOLS.map((p) => copyForCategory(p.key).label),
  /** AI 图总数 */
  aiCount: USABLE_POOLS.reduce((sum, p) => sum + p.ai.length, 0),
  /** 真实图总数 */
  realCount: USABLE_POOLS.reduce((sum, p) => sum + p.real.length, 0),
  /** 理论可组合出的不重复题目总数 */
  combinationCount: USABLE_POOLS.reduce((sum, p) => sum + p.ai.length * p.real.length, 0),
} as const
