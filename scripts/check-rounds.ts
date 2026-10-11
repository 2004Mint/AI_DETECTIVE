/**
 * 抽题自检脚本
 *
 * 换图 / 加图之后跑一次，确认素材与出题规则都没问题：
 *
 * ```bash
 * npm run check:rounds
 * ```
 *
 * 它会做三件事：
 * 1. **体检素材文件夹** —— 列出每个题材的 AI 图 / 真实图数量，
 *    指出命名不符合「题材_序号」的文件、同题材重名文件、缺少配对的题材；
 * 2. **对真实素材跑 2 万局抽题**，验证抽题规则：
 *    - 一局 10 题、题内两张图同题材；
 *    - 局内不出现重复的「题材 + AI 图 + 真实图」组合；
 *    - 局内任何一张图片都不会被用到两次；
 *    - 题材尽量均分（4 个题材各 5 张时即 3 / 3 / 2 / 2）；
 *    - 答案左右分布均衡（10 题 = 5 个 A + 5 个 B）；
 * 3. **验证最终组装出的题目**（走页面的同一份 `api/questionFactory.ts`）：
 *    题材标签、题号唯一性、AI 图所在侧、图片类型、文案是否来自该题材的文案池。
 *
 * 脚本直接复用工程里的 `assetName.ts` / `roundBuilder.ts` / `questionFactory.ts` /
 * `question-copy.ts`，用的是和页面完全相同的代码，不是另写一份实现。
 */
import { readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toQuestion } from '../src/api/questionFactory.ts'
import type { AssetRef } from '../src/api/questionFactory.ts'
import {
  CATEGORY_COPY,
  DEFAULT_CATEGORY_COPY,
  MASCOT_HINTS,
} from '../src/data/question-copy.ts'
import { parseAssetName } from '../src/utils/assetName.ts'
import { buildRoundPairs, planAiSides } from '../src/utils/roundBuilder.ts'
import type { RoundCategory } from '../src/utils/roundBuilder.ts'
import { TOTAL_ROUNDS } from '../src/utils/scoring.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ITERATIONS = 20000
const IMAGE_EXTENSION = /\.(png|jpe?g|webp|avif|gif|svg)$/i

/** 测试用素材：多带一个令牌，便于断言「题目里的图确实属于该题材」 */
interface TestAsset extends AssetRef {
  token: string
}

let failures = 0
/** 限制同类失败最多打印 5 条，避免刷屏 */
const failureDetailCount = new Map<string, number>()

function check(condition: boolean, label: string, detail?: string) {
  if (condition) return
  failures += 1
  const shown = failureDetailCount.get(label) ?? 0
  if (shown < 5) {
    failureDetailCount.set(label, shown + 1)
    console.error(`    ✗ ${label}${detail ? ` —— ${detail}` : ''}`)
  }
}

/* ---------------- 1. 扫描素材文件夹 ---------------- */

interface ScannedAsset {
  token: string
  order: number
}

interface ScannedDir {
  /** 题材键 → 素材（按序号排序，与页面构建顺序一致） */
  pools: Map<string, ScannedAsset[]>
  misnamed: string[]
  duplicates: string[]
  missing: boolean
}

function scanDir(dir: string): ScannedDir {
  const result: ScannedDir = { pools: new Map(), misnamed: [], duplicates: [], missing: false }

  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    result.missing = true
    return result
  }

  const tokenSeen = new Set<string>()
  for (const entry of entries) {
    if (!IMAGE_EXTENSION.test(entry)) continue
    if (!statSync(join(dir, entry)).isFile()) continue // 跳过子目录

    const parsed = parseAssetName(entry)
    if (!parsed) {
      result.misnamed.push(entry)
      continue
    }

    // 与页面行为一致：同题材同名不同扩展名只保留一个
    const dedupeKey = `${parsed.category}/${parsed.token}`
    if (tokenSeen.has(dedupeKey)) {
      result.duplicates.push(entry)
      continue
    }
    tokenSeen.add(dedupeKey)

    const list = result.pools.get(parsed.category) ?? []
    list.push({ token: parsed.token, order: parsed.order })
    result.pools.set(parsed.category, list)
  }

  for (const list of result.pools.values()) {
    list.sort((a, b) => a.order - b.order || a.token.localeCompare(b.token))
  }
  return result
}

/* ---------------- 2. 规则验证 ---------------- */

/** 某题材「应该」用的文案：已知题材取登记表，未知题材取兜底 + 原始键名当标签 */
function expectedCopy(key: string) {
  const known = CATEGORY_COPY[key]
  if (known) return { copy: known, label: known.label, known: true }
  return { copy: DEFAULT_CATEGORY_COPY, label: key, known: false }
}

/** 对给定素材池跑多局，逐条验证抽题规则与题目组装结果 */
function verifyPools(
  label: string,
  pools: ReadonlyArray<RoundCategory<TestAsset, TestAsset>>,
  rounds: number,
) {
  const capacities = pools.map((p) => Math.min(p.ai.length, p.real.length))
  const totalCapacity = capacities.reduce((sum, c) => sum + c, 0)
  const expectedRounds = Math.min(rounds, totalCapacity)
  const byKey = new Map(pools.map((p) => [p.key, p]))

  for (let round = 0; round < ITERATIONS; round++) {
    const pairs = buildRoundPairs(pools, rounds)

    check(
      pairs.length === expectedRounds,
      `${label}｜题数应为 ${expectedRounds}`,
      `实际 ${pairs.length}`,
    )
    if (pairs.length !== expectedRounds) continue

    const combos = new Set<string>()
    const usedAi = new Set<string>()
    const usedReal = new Set<string>()
    const counts = new Map<string, number>()

    for (const pair of pairs) {
      const pool = byKey.get(pair.categoryKey)

      // 两张图必须来自同一题材池
      check(pool !== undefined, `${label}｜题材存在`, pair.categoryKey)
      if (!pool) continue
      check(
        pool.ai.includes(pair.ai),
        `${label}｜AI 图属于该题材`,
        `${pair.categoryKey}/${pair.ai.token}`,
      )
      check(
        pool.real.includes(pair.real),
        `${label}｜真实图属于该题材`,
        `${pair.categoryKey}/${pair.real.token}`,
      )

      // 同一局内图片不能重复使用（ai/ 与 real/ 两个文件夹各自独立）
      const aiKey = `${pair.categoryKey}/${pair.ai.token}`
      const realKey = `${pair.categoryKey}/${pair.real.token}`
      check(!usedAi.has(aiKey), `${label}｜AI 图重复使用`, aiKey)
      check(!usedReal.has(realKey), `${label}｜真实图重复使用`, realKey)
      usedAi.add(aiKey)
      usedReal.add(realKey)

      // 题目组合不能重复
      const combo = `${aiKey}~${realKey}`
      check(!combos.has(combo), `${label}｜题目重复出现`, combo)
      combos.add(combo)

      counts.set(pair.categoryKey, (counts.get(pair.categoryKey) ?? 0) + 1)
    }

    // 题材尽量均分：只要某题材没用满，它的出题数就不能比别的题材少 2 题以上
    pools.forEach((pool) => {
      const mine = counts.get(pool.key) ?? 0
      const capacity = Math.min(pool.ai.length, pool.real.length)
      check(mine <= capacity, `${label}｜题材未超容量`, `${pool.key} ${mine}>${capacity}`)
      if (mine >= capacity) return
      pools.forEach((other) => {
        const theirs = counts.get(other.key) ?? 0
        if (theirs > mine + 1) {
          check(false, `${label}｜题材分配不均`, `${other.key} ${theirs} vs ${pool.key} ${mine}`)
        }
      })
    })

    // 答案左右均衡
    const sides = planAiSides(pairs.length)
    const sideA = sides.filter((s) => s === 'A').length
    check(
      Math.abs(sideA - (pairs.length - sideA)) <= 1,
      `${label}｜A / B 答案分布均衡`,
      `A=${sideA} B=${pairs.length - sideA}`,
    )

    /* ---- 题目组装结果 ---- */
    const questions = pairs.map((pair, index) => toQuestion(pair, sides[index] ?? 'A'))
    const ids = new Set<number>()

    questions.forEach((question, index) => {
      const pair = pairs[index]
      const side = sides[index] ?? 'A'
      const aiImage = side === 'A' ? question.imageA : question.imageB
      const realImage = side === 'A' ? question.imageB : question.imageA
      const { copy, label: expectedLabel } = expectedCopy(pair.categoryKey)

      // 图片身份与 URL 映射
      check(question.answer === side, `${label}｜答案侧与规划一致`, `${question.answer}≠${side}`)
      check(aiImage.type === 'ai', `${label}｜答案侧是 AI 图`, aiImage.type)
      check(realImage.type === 'real', `${label}｜另一侧是真实图`, realImage.type)
      check(
        aiImage.url === `ai/${pair.ai.token}`,
        `${label}｜AI 图 URL 对应正确素材`,
        `${aiImage.url} vs ai/${pair.ai.token}`,
      )
      check(
        realImage.url === `real/${pair.real.token}`,
        `${label}｜真实图 URL 对应正确素材`,
        `${realImage.url} vs real/${pair.real.token}`,
      )

      // 题材标签 / 真实侧称呼
      check(
        question.category === expectedLabel,
        `${label}｜题材标签正确`,
        `${question.category}≠${expectedLabel}`,
      )
      check(
        question.realLabel === copy.realLabel,
        `${label}｜真实侧称呼正确`,
        `${question.realLabel}≠${copy.realLabel}`,
      )

      // 文案校验：讲解来自题材文案池；研小鸿贴士来自全局通用池（不绑具体画面）
      check(
        copy.explanations.includes(question.explanation),
        `${label}｜讲解文案来自该题材文案池`,
        question.explanation,
      )
      check(
        MASCOT_HINTS.includes(question.aiHint),
        `${label}｜研小鸿贴士来自通用文案池`,
        question.aiHint,
      )
      check(copy.titles.includes(question.title), `${label}｜标题文案来自该题材文案池`, question.title)

      // 题号在一局内唯一
      check(!ids.has(question.id), `${label}｜题号在局内唯一`, String(question.id))
      ids.add(question.id)
    })
  }
}

/* ---------------- 3. 主流程 ---------------- */

console.log('素材来源：src/assets/images/{ai,real}\n')

const aiScan = scanDir(join(ROOT, 'src/assets/images/ai'))
const realScan = scanDir(join(ROOT, 'src/assets/images/real'))

for (const [dirName, scan] of [
  ['ai', aiScan],
  ['real', realScan],
] as const) {
  if (scan.missing) {
    console.error(`✗ 找不到目录 src/assets/images/${dirName}/`)
    failures += 1
  }
  if (scan.misnamed.length > 0) {
    console.error(
      `✗ src/assets/images/${dirName}/ 有 ${scan.misnamed.length} 个文件命名不符合「题材_序号」：` +
        scan.misnamed.join('、'),
    )
    failures += 1
  }
  if (scan.duplicates.length > 0) {
    console.error(
      `✗ src/assets/images/${dirName}/ 有同题材重名文件（只会用到其中一个）：` +
        scan.duplicates.join('、'),
    )
    failures += 1
  }
}

/** 把扫描结果装成素材池：题材键排序决定题号，题材内按序号决定 slot —— 与页面一致 */
function buildTestPools(
  keys: readonly string[],
  aiPools: Map<string, ScannedAsset[]>,
  realPools: Map<string, ScannedAsset[]>,
): RoundCategory<TestAsset, TestAsset>[] {
  return keys.map((key, rank) => {
    const toAsset = (dir: string, asset: ScannedAsset, slot: number): TestAsset => ({
      token: asset.token,
      url: `${dir}/${asset.token}`,
      categoryRank: rank,
      slot,
    })
    return {
      key,
      ai: (aiPools.get(key) ?? []).map((asset, slot) => toAsset('ai', asset, slot)),
      real: (realPools.get(key) ?? []).map((asset, slot) => toAsset('real', asset, slot)),
    }
  })
}

const allKeys = [...new Set([...aiScan.pools.keys(), ...realScan.pools.keys()])].sort()
const allPools = buildTestPools(allKeys, aiScan.pools, realScan.pools)
const pools = allPools.filter((p) => p.ai.length > 0 && p.real.length > 0)

console.log('题材清单：')
allPools.forEach((pool) => {
  const capacity = Math.min(pool.ai.length, pool.real.length)
  const note =
    capacity === 0
      ? '  ✗ 缺少配对，不会出题'
      : `  可组合 ${pool.ai.length * pool.real.length} 种题目，本局最多出 ${capacity} 题`
  console.log(
    `  ${pool.key.padEnd(12)} AI ${String(pool.ai.length).padStart(2)} 张 · ` +
      `真实 ${String(pool.real.length).padStart(2)} 张${note}`,
  )
  if (capacity === 0) failures += 1
})

const realCapacity = pools.reduce((sum, p) => sum + Math.min(p.ai.length, p.real.length), 0)
console.log(
  `\n合计：${pools.length} 个题材 · 可组合 ${
    pools.reduce((sum, p) => sum + p.ai.length * p.real.length, 0)
  } 种不重复题目 · 单局最多可出 ${realCapacity} 题`,
)

if (pools.length === 0) {
  console.error('\n✗ 没有可用素材，无法验证抽题规则。')
  process.exit(1)
}
if (realCapacity < TOTAL_ROUNDS) {
  console.error(
    `\n✗ 素材不足：一局需要 ${TOTAL_ROUNDS} 题，但可出题上限只有 ${realCapacity} 题` +
      `（同一张图在一局内不会重复使用，请补足素材或减少关卡数）`,
  )
  failures += 1
}

console.log(`\n对真实素材跑 ${ITERATIONS} 局抽题 + 题目组装验证 ...`)
verifyPools('真实素材', pools, TOTAL_ROUNDS)

console.log('\n边界场景验证（素材不均衡时仍要优雅降级）...')
const mk = (key: string, count: number, rank: number): RoundCategory<TestAsset, TestAsset> => ({
  key,
  ai: Array.from({ length: count }, (_, i) => ({
    token: `${key}_${i + 1}`,
    url: `ai/${key}_${i + 1}`,
    categoryRank: rank,
    slot: i,
  })),
  real: Array.from({ length: count }, (_, i) => ({
    token: `${key}_r${i + 1}`,
    url: `real/${key}_r${i + 1}`,
    categoryRank: rank,
    slot: i,
  })),
})
const synthetic: Array<{ label: string; pools: RoundCategory<TestAsset, TestAsset>[] }> = [
  { label: '4 题材各 5 张', pools: ['a', 'b', 'c', 'd'].map((k, i) => mk(k, 5, i)) },
  {
    label: '素材不均衡 1 / 5 / 5 / 5 张',
    pools: [mk('a', 1, 0), mk('b', 5, 1), mk('c', 5, 2), mk('d', 5, 3)],
  },
  { label: '只有 2 个题材', pools: [mk('a', 6, 0), mk('b', 6, 1)] },
  { label: '只有 1 个题材 4 张', pools: [mk('a', 4, 0)] },
]
for (const item of synthetic) {
  const capacity = item.pools.reduce((sum, p) => sum + Math.min(p.ai.length, p.real.length), 0)
  console.log(`  ${item.label} → 一局出 ${Math.min(TOTAL_ROUNDS, capacity)} 题`)
  verifyPools(item.label, item.pools, TOTAL_ROUNDS)
}

/* ---------------- 4. 结论 ---------------- */

console.log('')
if (failures === 0) {
  console.log(
    `✅ 抽题自检全部通过（${ITERATIONS} 局 × ${1 + synthetic.length} 组场景：` +
      '无重复出题、无重复用图、题材均分、题目组装正确）',
  )
  process.exit(0)
}
console.error(`❌ 抽题自检发现 ${failures} 处问题，请查看上面的 ✗ 列表。`)
process.exit(1)
