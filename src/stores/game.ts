/**
 * Pinia 游戏状态管理
 *
 * 状态字段对照需求「九、游戏状态」：gameId / currentIndex / score / combo /
 * maxCombo / correctCount / questions / answers，另加 status 描述整局所处阶段。
 *
 * 附加能力：
 * 1. 快照持久化（localStorage）：挑战途中返回首页 / 刷新 / 关掉页面重进都可以接着玩；
 *    首页在存在未完成挑战时会显示「继续挑战」；
 * 2. 答题防重入：同一道题只允许提交一次。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { buildRoundQuestions } from '@/api/questions'
import type { AnswerResult, Question, RoundAnswer, RunSnapshot, Side } from '@/types/game'
import { createGameId, roundPoints, TOTAL_ROUNDS } from '@/utils/scoring'

/** 快照键：v2 起题目改为按素材文件夹动态生成，旧版（手写题库）快照不再兼容 */
const STORAGE_KEY = 'ai-detective:run:v2'

export type RunStatus = 'idle' | 'playing' | 'finished'

/* ---------------- 快照存取 ---------------- */

/** 宽松校验反序列化结果，避免脏数据导致页面异常 */
function isRunSnapshot(value: unknown): value is RunSnapshot {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.gameId === 'number' &&
    (v.status === 'playing' || v.status === 'finished') &&
    typeof v.currentIndex === 'number' &&
    typeof v.score === 'number' &&
    typeof v.combo === 'number' &&
    typeof v.maxCombo === 'number' &&
    typeof v.correctCount === 'number' &&
    Array.isArray(v.questions) &&
    v.questions.length > 0 &&
    Array.isArray(v.answers)
  )
}

function loadSnapshot(): RunSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isRunSnapshot(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const useGameStore = defineStore('game', () => {
  /* ---------------- state ---------------- */
  const status = ref<RunStatus>('idle')
  const gameId = ref(0)
  const currentIndex = ref(0)
  const score = ref(0)
  const combo = ref(0)
  const maxCombo = ref(0)
  const correctCount = ref(0)
  const questions = ref<Question[]>([])
  const answers = ref<RoundAnswer[]>([])

  // 进入应用时尝试恢复未完成/已完成的挑战
  const snapshot = loadSnapshot()
  if (snapshot) {
    status.value = snapshot.status
    gameId.value = snapshot.gameId
    currentIndex.value = snapshot.currentIndex
    score.value = snapshot.score
    combo.value = snapshot.combo
    maxCombo.value = snapshot.maxCombo
    correctCount.value = snapshot.correctCount
    questions.value = snapshot.questions
    answers.value = snapshot.answers
  }

  /* ---------------- getters ---------------- */
  /** 当前关卡（0 起），题目没抽出来时为 null */
  const currentQuestion = computed(() => questions.value[currentIndex.value] ?? null)
  /** 已答题目数 */
  const answeredCount = computed(() => answers.value.length)
  /** 进度条百分比（未开战时 0） */
  const progressPercent = computed(() =>
    status.value === 'playing' || status.value === 'finished'
      ? Math.round((answeredCount.value / TOTAL_ROUNDS) * 100)
      : 0,
  )
  /** 正确率（已答题数为 0 时返回 0） */
  const accuracy = computed(() =>
    answeredCount.value === 0 ? 0 : Math.round((correctCount.value / answeredCount.value) * 100),
  )
  /** 最近一次作答记录 */
  const lastAnswer = computed(() => answers.value[answers.value.length - 1] ?? null)
  /** 是否已答完全部 10 题 */
  const allAnswered = computed(() => answeredCount.value >= TOTAL_ROUNDS)

  /* ---------------- helpers ---------------- */
  function isAnsweredCurrent(): boolean {
    const q = currentQuestion.value
    return q !== null && answers.value.some((a) => a.questionId === q.id)
  }

  function save() {
    try {
      if (status.value === 'idle') {
        localStorage.removeItem(STORAGE_KEY)
        return
      }
      const payload: RunSnapshot = {
        gameId: gameId.value,
        status: status.value,
        currentIndex: currentIndex.value,
        score: score.value,
        combo: combo.value,
        maxCombo: maxCombo.value,
        correctCount: correctCount.value,
        questions: questions.value,
        answers: answers.value,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* 隐私模式等场景写入失败时忽略，不影响游戏 */
    }
  }

  /* ---------------- actions ---------------- */
  /** 开始/重开一局：重新洗牌抽题，清空所有进度 */
  function startGame() {
    questions.value = buildRoundQuestions()
    gameId.value = createGameId()
    status.value = 'playing'
    currentIndex.value = 0
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    correctCount.value = 0
    answers.value = []
    save()
  }

  /**
   * 提交当前题目的选择。
   * 返回本题结算；若当前不可作答（已作答/状态不对）返回 null。
   */
  function answer(choice: Side): AnswerResult | null {
    const q = currentQuestion.value
    if (status.value !== 'playing' || q === null || isAnsweredCurrent()) return null

    const correct = q.answer === choice
    combo.value = correct ? combo.value + 1 : 0
    if (correct) correctCount.value += 1

    const { bonus, total } = correct ? roundPoints(combo.value) : { bonus: 0, total: 0 }
    score.value += total
    if (combo.value > maxCombo.value) maxCombo.value = combo.value

    answers.value.push({
      questionId: q.id,
      choice,
      correct,
      gained: total,
      bonus,
      comboAfter: combo.value,
    })
    save()

    return {
      correct,
      gained: total,
      bonus,
      comboAfter: combo.value,
      isLastRound: allAnswered.value,
    }
  }

  /**
   * 进入下一题；已经是最后一题则结算整局。
   * @returns 'next' 还有下一题；'finished' 游戏结束
   */
  function nextRound(): 'next' | 'finished' {
    if (allAnswered.value) {
      finishGame()
      return 'finished'
    }
    currentIndex.value += 1
    save()
    return 'next'
  }

  /** 结束整局（最后一题答完后调用） */
  function finishGame() {
    if (status.value === 'playing') {
      status.value = 'finished'
      save()
    }
  }

  /** 放弃当前挑战（回到首页时清理） */
  function abandon() {
    status.value = 'idle'
    gameId.value = 0
    currentIndex.value = 0
    score.value = 0
    combo.value = 0
    maxCombo.value = 0
    correctCount.value = 0
    questions.value = []
    answers.value = []
    save()
  }

  return {
    /* state */
    status,
    gameId,
    currentIndex,
    score,
    combo,
    maxCombo,
    correctCount,
    questions,
    answers,
    /* getters */
    currentQuestion,
    answeredCount,
    progressPercent,
    accuracy,
    lastAnswer,
    allAnswered,
    /* actions */
    startGame,
    answer,
    nextRound,
    finishGame,
    abandon,
  }
})
