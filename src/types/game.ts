/**
 * 游戏核心类型定义
 * 约定：题目中图片 A / B 各有一张为 ai(由AI生成)、另一张为 real(真实照片)。
 */

/** 图片属性：ai = AI 生成图；real = 真实图（相机照片或人类画师作品） */
export type ImageType = 'ai' | 'real'

/** 玩家作答选项：图片 A 还是图片 B */
export type Side = 'A' | 'B'

/** 单张候选图片 */
export interface QuestionImage {
  /** 图片地址（构建时解析出的打包 URL） */
  url: string
  /** 图片真实身份 */
  type: ImageType
}

/** 一道题：两张候选图片 + 正确答案 + 知识讲解 */
export interface Question {
  id: number
  /** 展示标题（玩法提示文案） */
  title: string
  /** 题材分类，例如：动物 / 美食 / 风景 / 绘画 */
  category: string
  /** 真实图那一侧的称呼（照片题材为「真实照片」，绘画题材为「人类画作」） */
  realLabel: string
  imageA: QuestionImage
  imageB: QuestionImage
  /** 正确答案：哪张是 AI 生成的 */
  answer: Side
  /**
   * 「AI 破绽」讲解（按题材的文案池随机取一条）
   * 注意：结果弹窗目前不展示知识卡，该字段仅保留备用。
   */
  explanation: string
  /** 研小鸿贴士（全局通用文案，不涉及具体画面内容，任何题目都成立） */
  aiHint: string
}

/** 单题作答记录 */
export interface RoundAnswer {
  questionId: number
  choice: Side
  /** 是否正确 */
  correct: boolean
  /** 本题获得积分（含连击奖励） */
  gained: number
  /** 其中连击奖励部分 */
  bonus: number
  /** 作答后的连击数 */
  comboAfter: number
}

/** 称号 */
export interface TitleInfo {
  /** 称号唯一键 */
  key: string
  name: string
  emoji: string
  /** 研小鸿的评价 */
  comment: string
  /** 称号徽章渐变样式类 */
  gradient: string
}

/** 当前一局的状态（用于刷新恢复） */
export interface RunSnapshot {
  gameId: number
  status: 'playing' | 'finished'
  currentIndex: number
  score: number
  combo: number
  maxCombo: number
  correctCount: number
  questions: Question[]
  answers: RoundAnswer[]
}

/** 一次作答的结算结果 */
export interface AnswerResult {
  correct: boolean
  gained: number
  bonus: number
  comboAfter: number
  isLastRound: boolean
}
