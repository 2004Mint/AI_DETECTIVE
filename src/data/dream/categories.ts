/**
 * AI 造梦事务所 · 分类定义
 *
 * 只放「结构」：分类键、名称、图标、一句话说明。
 * 作品本身在 `src/data/dream/works.ts`。
 *
 * `label` 是完整名称（详情页 / 分类页标题），`short` 是导航和卡片上的短标签。
 */
import type { Component } from 'vue'
import { Image, Music, PenLine, Sparkles } from 'lucide-vue-next'
import type { DreamCategoryKey } from '@/types/dream'

export interface DreamCategory {
  /** 分类键（同时也是路由参数） */
  key: DreamCategoryKey
  /** 完整名称 */
  label: string
  /** 短名称：导航胶囊、作品卡片、榜单用 */
  short: string
  /** 英文角标 */
  en: string
  /** 一句话说明 */
  blurb: string
  /** 二级标签 */
  tags: string[]
  /** 图标组件 */
  icon: Component
}

export const DREAM_CATEGORIES: readonly DreamCategory[] = [
  {
    key: 'visual',
    label: 'AI 视觉创作',
    short: 'AI 视觉',
    en: 'VISUAL',
    blurb: '画面是最直接的语言：插画、风景、人物、海报与概念艺术。',
    tags: ['AI 动漫插画', 'AI 风景', 'AI 人物', 'AI 创意海报', 'AI 概念艺术'],
    icon: Image,
  },
  {
    key: 'text',
    label: 'AI 文字创作',
    short: 'AI 文字',
    en: 'TEXT',
    blurb: '同一个主题，换一种文体，就是另一种想象。',
    tags: ['AI 短诗', 'AI 故事', 'AI 趣味文案', 'AI 创意表达', '同主题多风格'],
    icon: PenLine,
  },
  {
    key: 'music',
    label: 'AI 音乐创作',
    short: 'AI 音乐',
    en: 'MUSIC',
    blurb: '旋律、氛围与封面，一起构成一段声音的想象。',
    tags: ['AI 原创歌曲', 'AI 纯音乐', 'AI 音乐封面', '多风格音乐成果'],
    icon: Music,
  },
  {
    key: 'idea',
    label: 'AI 奇思妙想',
    short: 'AI 脑洞',
    en: 'IDEAS',
    blurb: '不那么「正确」的脑洞，才是想象力最野的地方。',
    tags: ['AI 脑洞作品', '创意实验', '超现实艺术', '趣味生成结果'],
    icon: Sparkles,
  },
]

const BY_KEY = new Map<DreamCategoryKey, DreamCategory>(
  DREAM_CATEGORIES.map((category) => [category.key, category]),
)

/** 按键取分类；不存在时返回 undefined（用于路由参数校验） */
export function dreamCategoryOf(key: string | undefined | null): DreamCategory | undefined {
  if (!key) return undefined
  return BY_KEY.get(key as DreamCategoryKey)
}

/** 判断任意字符串是否是一个合法分类键 */
export function isDreamCategoryKey(value: unknown): value is DreamCategoryKey {
  return typeof value === 'string' && BY_KEY.has(value as DreamCategoryKey)
}
