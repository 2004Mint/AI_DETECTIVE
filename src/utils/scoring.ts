/**
 * 计分 / 称号 等纯函数工具
 * 规则来源：需求文档「十二、积分规则」与「五、结算页面-称号规则」
 * （抽题规则见 `utils/roundBuilder.ts`）
 */
import type { TitleInfo } from '@/types/game'

/** 一局总关卡数 */
export const TOTAL_ROUNDS = 10
/** 基础分：答对一题 */
export const BASE_SCORE = 100

/**
 * 连击奖励：连续答对时的里程碑加成。
 * 需求：连对 2 题 +50、3 题 +100、5 题 +200，答错归零。
 * 实现：以 5 连为一个奖励周期（2→+50, 3→+100, 5→+200，周期结束后循环：
 * 7→+50, 8→+100, 10→+200 ……），鼓励玩家冲击更高的连胜。
 * 单局最高可得 1700 分（100×10 + 奖励 700）。
 */
const BONUS_CYCLE: ReadonlyArray<number> = [50, 100, 0, 200, 0]

/** 计算第 streak 次连续答对时的额外奖励分 */
export function comboBonus(streak: number): number {
  if (streak < 2) return 0
  return BONUS_CYCLE[(streak - 2) % BONUS_CYCLE.length] ?? 0
}

/** 答对一题的总得分 = 基础分 + 连击奖励 */
export function roundPoints(streak: number): { base: number; bonus: number; total: number } {
  const bonus = comboBonus(streak)
  return { base: BASE_SCORE, bonus, total: BASE_SCORE + bonus }
}

/** 称号梯度表（按答对题数升序） */
const TITLES: ReadonlyArray<{ min: number; info: TitleInfo }> = [
  {
    min: 10,
    info: {
      key: 'master',
      name: '人类观察大师',
      emoji: '👑',
      comment: '连 AI 都骗不过你的眼睛，人类的火眼金睛就交给你守护啦！',
      gradient: 'from-amber-300 via-yellow-400 to-orange-400',
    },
  },
  {
    min: 8,
    info: {
      key: 'detective',
      name: 'AI 鉴定师',
      emoji: '🕵️',
      comment: '像素级推理、光影级判断，你已经是一名合格的 AI 鉴定师了！',
      gradient: 'from-rose-400 via-pink-500 to-orange-400',
    },
  },
  {
    min: 6,
    info: {
      key: 'scout',
      name: 'AI 侦察员',
      emoji: '🔍',
      comment: '细节逃不过你的侦察，再练练就能看穿 AI 的伪装啦。',
      gradient: 'from-cyan-300 via-sky-400 to-blue-400',
    },
  },
  {
    min: 3,
    info: {
      key: 'observer',
      name: 'AI 观察员',
      emoji: '🔭',
      comment: '已经学会观察 AI 的蛛丝马迹了，继续观察会越来越准哦。',
      gradient: 'from-emerald-300 via-teal-400 to-cyan-400',
    },
  },
  {
    min: 0,
    info: {
      key: 'intern',
      name: 'AI 实习生',
      emoji: '🐣',
      comment: '刚入行不丢人！跟着研小鸿多看多练，下一个鉴定大师就是你。',
      gradient: 'from-slate-300 via-slate-400 to-slate-500',
    },
  },
]

/** 根据答对数量获取称号 */
export function titleOf(correctCount: number): TitleInfo {
  const hit = TITLES.find((t) => correctCount >= t.min)
  return (hit ?? TITLES[TITLES.length - 1]).info
}

/** 简单随机 gameId */
export function createGameId(): number {
  return Date.now() * 100 + Math.floor(Math.random() * 100)
}

/** 生成一个 0~999 的确定性伪随机数（装饰动画用，无需加密随机） */
export function seededIndex(seed: number, salt: number): number {
  return Math.floor(Math.abs(Math.sin(seed * 12.9898 + salt * 78.233)) * 10000) % 1000
}
