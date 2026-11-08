/**
 * AI 人格研究所 · 匹配规则（纯函数，方便单独自检）
 *
 * 规则：
 * 1. 每个选项给 1～2 个性格加分（主性格 +2，副性格 +1），总分累加；
 * 2. 取总分最高的性格作为主结果；
 * 3. 并列时依次比较第 5、4、3、2、1 题的单项得分——
 *    也就是「最后一题更想成为谁」优先，仍然并列则按 TYPE-01…TYPE-08 的档案编号顺序取靠前的。
 *
 * 这套规则完全确定：同一组答案永远得到同一个人格，且不依赖数组顺序以外的任何运行时状态。
 */
import { PERSONALITIES, PERSONALITY_KEYS } from './personalities.ts'
import { PERSONALITY_QUESTIONS } from './questions.ts'
import type {
  PersonalityKey,
  PersonalityResult,
  QuizAnswers,
  QuizQuestion,
} from '@/types/personality'

/** 全 0 的得分表 */
export function emptyScores(): Record<PersonalityKey, number> {
  return PERSONALITY_KEYS.reduce(
    (acc, key) => {
      acc[key] = 0
      return acc
    },
    {} as Record<PersonalityKey, number>,
  )
}

/** 找到作答对应的选项 */
function optionScores(question: QuizQuestion, answerId: string | null) {
  if (!answerId) return null
  return question.options.find((option) => option.id === answerId)?.scores ?? null
}

/**
 * 逐题累加得分。
 * 返回总分和「每题各性格得分」，决胜规则要用后者。
 */
export function scoreAnswers(answers: QuizAnswers): {
  scores: Record<PersonalityKey, number>
  perQuestion: Array<Record<PersonalityKey, number>>
} {
  const scores = emptyScores()
  const perQuestion: Array<Record<PersonalityKey, number>> = []

  PERSONALITY_QUESTIONS.forEach((question, index) => {
    const row = emptyScores()
    const hit = optionScores(question, answers[index] ?? null)
    if (hit) {
      for (const [key, value] of Object.entries(hit)) {
        const typedKey = key as PersonalityKey
        const points = value ?? 0
        row[typedKey] += points
        scores[typedKey] += points
      }
    }
    perQuestion.push(row)
  })

  return { scores, perQuestion }
}

/** 是否五题都答完了 */
export function isComplete(answers: QuizAnswers): boolean {
  return (
    answers.length === PERSONALITY_QUESTIONS.length &&
    PERSONALITY_QUESTIONS.every((_, index) => Boolean(answers[index]))
  )
}

/**
 * 决胜规则：
 * 从最后一题往前比单项得分，第一个分出高下的题决定胜负；
 * 五题都一样时，按档案编号顺序（TYPE-01 优先）。
 */
export function breakTie(
  tied: readonly PersonalityKey[],
  perQuestion: Array<Record<PersonalityKey, number>>,
): PersonalityKey {
  for (let q = perQuestion.length - 1; q >= 0; q--) {
    const row = perQuestion[q]
    if (!row) continue
    let best = tied[0] as PersonalityKey
    let bestScore = -1
    for (const key of tied) {
      if (row[key] > bestScore) {
        best = key
        bestScore = row[key]
      }
    }
    const winners = tied.filter((key) => row[key] === bestScore)
    if (winners.length === 1) return best
  }
  // 仍然并列（理论上只有「五题选择完全不影响这两个性格」才会发生）
  return [...tied].sort((a, b) => PERSONALITY_KEYS.indexOf(a) - PERSONALITY_KEYS.indexOf(b))[0] as PersonalityKey
}

/** 主入口：作答 → 结果；没答完返回 null */
export function matchPersonality(answers: QuizAnswers): PersonalityResult | null {
  if (!isComplete(answers)) return null

  const { scores, perQuestion } = scoreAnswers(answers)
  const topScore = Math.max(...PERSONALITY_KEYS.map((key) => scores[key]))
  const tied = PERSONALITY_KEYS.filter((key) => scores[key] === topScore)
  const winner =
    tied.length > 1 ? breakTie(tied, perQuestion) : (tied[0] as PersonalityKey)
  const personality = PERSONALITIES.find((item) => item.key === winner)

  if (!personality) return null
  return { personality, scores, topScore, tied }
}

