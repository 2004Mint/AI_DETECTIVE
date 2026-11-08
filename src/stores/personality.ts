/**
 * AI 人格研究所 · 状态
 *
 * 五道题的作答进度存在 localStorage（键 `ai-personality:v1`），
 * 现场刷新 / 误触返回都不会丢答案；「重新测试」会清空整份档案。
 *
 * 只有作答数据，没有任何个人信息——不记昵称、不记设备、不上传。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { PERSONALITY_QUESTIONS } from '@/data/personality/questions'
import { isComplete, matchPersonality } from '@/data/personality/matching'
import type { OptionId } from '@/types/personality'

const STORAGE_KEY = 'ai-personality:v1'

/** 本地保存的结构 */
interface PersonalitySnapshot {
  /** 每题选的选项 id，未作答为 null */
  answers: Array<OptionId | null>
  /** 当前在第几题（0 起） */
  current: number
}

const OPTION_IDS: readonly OptionId[] = ['A', 'B', 'C', 'D']

function emptyAnswers(): Array<OptionId | null> {
  return PERSONALITY_QUESTIONS.map(() => null)
}

/** 宽松校验：只接受长度正确、选项合法的快照，脏数据一律当没答过 */
function parseSnapshot(raw: unknown): PersonalitySnapshot | null {
  if (typeof raw !== 'object' || raw === null) return null
  const value = raw as Record<string, unknown>
  if (!Array.isArray(value.answers)) return null
  if (value.answers.length !== PERSONALITY_QUESTIONS.length) return null

  const answers: Array<OptionId | null> = []
  for (const item of value.answers) {
    if (item === null || item === undefined) answers.push(null)
    else if (typeof item === 'string' && OPTION_IDS.includes(item as OptionId)) answers.push(item as OptionId)
    else return null
  }

  const current = typeof value.current === 'number' && Number.isFinite(value.current) ? value.current : 0
  return {
    answers,
    current: Math.min(Math.max(Math.trunc(current), 0), PERSONALITY_QUESTIONS.length - 1),
  }
}

function readSnapshot(): PersonalitySnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseSnapshot(JSON.parse(raw))
  } catch {
    return null
  }
}

export const usePersonalityStore = defineStore('personality', () => {
  const answers = ref<Array<OptionId | null>>(emptyAnswers())
  const current = ref(0)
  const hydrated = ref(false)

  /** 已作答的题数 */
  const answeredCount = computed(() => answers.value.filter(Boolean).length)
  /** 五题是否答完 */
  const complete = computed(() => isComplete(answers.value))
  /** 匹配结果（未答完为 null） */
  const result = computed(() => matchPersonality(answers.value))
  /** 当前题目 */
  const question = computed(() => PERSONALITY_QUESTIONS[current.value])
  /** 进度百分比 */
  const percent = computed(() => Math.round((answeredCount.value / PERSONALITY_QUESTIONS.length) * 100))

  function persist(): void {
    try {
      const snapshot: PersonalitySnapshot = { answers: answers.value, current: current.value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
      // 隐私模式 / 存储写满时静默失败：大不了刷新后重答
    }
  }

  /** 页面挂载时调用一次；重复调用不会再覆盖当前进度 */
  function hydrate(): void {
    if (hydrated.value) return
    hydrated.value = true
    const snapshot = readSnapshot()
    if (!snapshot) return
    answers.value = snapshot.answers
    current.value = snapshot.current
  }

  /** 选中当前题的某个选项 */
  function choose(id: OptionId): void {
    answers.value[current.value] = id
    persist()
  }

  /** 直接跳到某一题（返回上一题用） */
  function goTo(index: number): void {
    current.value = Math.min(Math.max(Math.trunc(index), 0), PERSONALITY_QUESTIONS.length - 1)
    persist()
  }

  /** 下一题；已经是最后一题则停在原地（由页面决定去结果页） */
  function next(): void {
    if (current.value < PERSONALITY_QUESTIONS.length - 1) goTo(current.value + 1)
  }

  /** 上一题 */
  function back(): void {
    if (current.value > 0) goTo(current.value - 1)
  }

  /** 重新测试：清空答案与本地快照 */
  function reset(): void {
    answers.value = emptyAnswers()
    current.value = 0
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // 忽略
    }
  }

  return {
    answers,
    current,
    hydrated,
    answeredCount,
    complete,
    result,
    question,
    percent,
    hydrate,
    choose,
    goTo,
    next,
    back,
    reset,
  }
})
