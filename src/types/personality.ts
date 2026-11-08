/**
 * AI 人格研究所 · 数据模型
 *
 * 设计原则与「AI 造梦事务所」一致：内容与页面分离。
 * 页面的所有文案、配色、题目、计分都来自 data 目录，改内容不用碰组件。
 */

/** 八种人格的键（同时用于计分表、路由和画布导出） */
export type PersonalityKey =
  | 'creator'
  | 'observer'
  | 'explorer'
  | 'healer'
  | 'host'
  | 'doer'
  | 'dreamer'
  | 'player'

/**
 * 一种人格的全部展示内容。
 * 结果页只消费这个结构，八种人格各写各的，不做「换名字」式复用。
 */
export interface Personality {
  key: PersonalityKey
  /** 档案编号：TYPE-01 … TYPE-08 */
  code: string
  /** 人格名称 */
  name: string
  /** 英文代号，给档案卡做装饰 */
  en: string
  /** 主题色（十六进制），用于标签、描边与结果图导出 */
  accent: string
  /** 三个关键词标签 */
  keywords: readonly [string, string, string]
  /** 一句话人格宣言 */
  declaration: string
  /** 趣味人格描述（2～3 句，短、好读） */
  description: string
  /** 三条行为特点 */
  traits: readonly [string, string, string]
  /** 一句专属台词 */
  quote: string
}

/** 选项编号 */
export type OptionId = 'A' | 'B' | 'C' | 'D'

/**
 * 一个选项。
 * `scores` 只写需要加分的性格：主性格 +2，副性格 +1，不写＝0 分。
 */
export interface QuizOption {
  id: OptionId
  label: string
  scores: Partial<Record<PersonalityKey, number>>
}

/** 一道题 */
export interface QuizQuestion {
  id: string
  /** 题号，从 1 开始 */
  index: number
  /** 题干上方的小标签（英文，档案感） */
  kicker: string
  title: string
  options: readonly QuizOption[]
}

/** 用户的作答：每题存选项 id，未作答为 null */
export type QuizAnswers = ReadonlyArray<OptionId | null>

/** 匹配结果 */
export interface PersonalityResult {
  personality: Personality
  /** 八个性格各自的总分（结果页不用展示，留给自检与调试） */
  scores: Record<PersonalityKey, number>
  /** 最高分 */
  topScore: number
  /** 与最高分并列的性格；长度 > 1 说明触发了决胜规则 */
  tied: PersonalityKey[]
}
