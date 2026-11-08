/**
 * AI 人格研究所 · 匹配规则自检
 *
 *   npm run check:personality
 *
 * 检查：
 * 1. 题目 / 选项 / 计分表结构是否完整（每题的选项指向是否合理）；
 * 2. 1024 种作答组合里，八种人格是否都能「正常胜出」；
 * 3. 同一组答案跑两遍结果是否一致（确定性）；
 * 4. 并列情况有多少、决胜规则是否稳定；
 * 5. 结果分布是否过于集中（避免某个人格 80% 的人都抽到）。
 *
 * 直接 import 页面用的同一份数据与匹配函数，不另写一份逻辑。
 */
import { PERSONALITIES, PERSONALITY_KEYS } from '../src/data/personality/personalities.ts'
import { PERSONALITY_QUESTIONS } from '../src/data/personality/questions.ts'
import { breakTie, matchPersonality, scoreAnswers } from '../src/data/personality/matching.ts'
import type { OptionId, PersonalityKey, QuizAnswers } from '../src/types/personality.ts'

let errors = 0
let warnings = 0

function fail(message: string): void {
  errors += 1
  console.error(`  ✗ ${message}`)
}

function warn(message: string): void {
  warnings += 1
  console.warn(`  ! ${message}`)
}

console.log('\nAI 人格研究所 · 匹配规则自检\n')

/* ---------------- 1. 结构检查 ---------------- */
console.log('题目结构')
for (const question of PERSONALITY_QUESTIONS) {
  const ids = question.options.map((option) => option.id).join('')
  if (ids !== 'ABCD') fail(`${question.id} 选项不是 A/B/C/D：${ids}`)
  if (question.options.length !== 4) fail(`${question.id} 选项数量为 ${question.options.length}`)
  for (const option of question.options) {
    const keys = Object.keys(option.scores) as PersonalityKey[]
    if (keys.length === 0) fail(`${question.id}-${option.id} 没有任何计分`)
    if (keys.length > 2) warn(`${question.id}-${option.id} 同时指向 ${keys.length} 个性格，容易让结果变糊`)
    for (const key of keys) {
      if (!PERSONALITY_KEYS.includes(key)) fail(`${question.id}-${option.id} 出现未知性格：${key}`)
    }
  }
}
console.log(`  · ${PERSONALITY_QUESTIONS.length} 道题 / 每题 4 个选项 / 共 ${PERSONALITIES.length} 种人格`)

/* ---------------- 2. 全量枚举 ---------------- */
const optionIds: OptionId[] = ['A', 'B', 'C', 'D']
const answersPool: OptionId[][] = []
PERSONALITY_QUESTIONS.reduce<OptionId[][]>(
  (acc, _question) => {
    const next: OptionId[][] = []
    for (const prefix of acc) {
      for (const id of optionIds) next.push([...prefix, id])
    }
    return next
  },
  [[]],
).forEach((combo) => answersPool.push(combo))

const total = answersPool.length
const hits = new Map<PersonalityKey, number>()
let tieCount = 0
let deterministicBreaks = 0

for (const combo of answersPool) {
  const answers: QuizAnswers = combo
  const first = matchPersonality(answers)
  const second = matchPersonality(answers)

  if (!first) {
    fail(`作答 ${combo.join('')} 没有匹配到人格`)
    continue
  }
  if (first.personality.key !== second?.personality.key) {
    fail(`作答 ${combo.join('')} 两次结果不一致`)
  }
  if (first.tied.length > 1) {
    tieCount += 1
    const { perQuestion } = scoreAnswers(answers)
    const resolved = breakTie(first.tied, perQuestion)
    if (resolved !== first.personality.key) fail(`作答 ${combo.join('')} 并列决胜不稳定`)
    deterministicBreaks += 1
  }
  hits.set(first.personality.key, (hits.get(first.personality.key) ?? 0) + 1)
}

/* ---------------- 3. 覆盖与分布 ---------------- */
console.log('\n八种人格覆盖（共 ' + total + ' 种作答组合）')
for (const personality of PERSONALITIES) {
  const count = hits.get(personality.key) ?? 0
  const percent = ((count / total) * 100).toFixed(1)
  const bar = '█'.repeat(Math.round((count / total) * 40))
  console.log(`  ${personality.code} ${personality.name.padEnd(11, '　')} ${String(count).padStart(4)} 次 ${percent.padStart(5)}% ${bar}`)
  if (count === 0) fail(`${personality.code} ${personality.name} 无法被任何作答组合命中`)
  if (count / total > 0.35) warn(`${personality.name} 占比 ${percent}%，结果过于集中，建议调整计分`)
  if (count / total < 0.02) warn(`${personality.name} 占比 ${percent}%，几乎抽不到`)
}

console.log(`\n并列情况：${tieCount} / ${total}（${((tieCount / total) * 100).toFixed(1)}%），决胜规则全部稳定`)
if (deterministicBreaks !== tieCount) fail('并列决胜计数异常')

console.log('')
if (errors === 0) {
  console.log(`✅ 匹配规则通过（${total} 种组合全量验证，${warnings} 条提醒）`)
  process.exit(0)
}
console.error(`❌ 发现 ${errors} 个问题、${warnings} 条提醒`)
process.exit(1)
