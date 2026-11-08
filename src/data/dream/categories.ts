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
  /** 极短名称（去掉「AI」前缀）：手机分类栏、封面小徽标用，两三个字刚好不挤 */
  mini: string
  /** 英文角标 */
  en: string
  /** 一句话说明 */
  blurb: string
  /** 二级标签 */
  tags: string[]
  /** 图标组件 */
  icon: Component
  /**
   * 分类色标（CSS 颜色值）。
   *
   * 只用在「很轻」的地方：分类栏选中态、封面徽标、榜单小圆点。
   * 四个色相刻意都做了高明度柔化（近粉彩），压在暖可可底色上不会抢图片；
   * 分类同时还有图标这一层区分，不依赖颜色单独传达信息。
   */
  accent: string
}

/** 「全部」的选中色：暖白，用来和「AI 视觉」的金色区分开 */
export const DREAM_ALL_ACCENT = '#efe4d6'

export const DREAM_CATEGORIES: readonly DreamCategory[] = [
  {
    key: 'visual',
    label: 'AI 视觉创作',
    short: 'AI 视觉',
    mini: '视觉',
    en: 'VISUAL',
    blurb: '画面是最直接的语言：插画、风景、人物、海报与概念艺术。',
    tags: ['AI 动漫插画', 'AI 风景', 'AI 人物', 'AI 创意海报', 'AI 概念艺术'],
    icon: Image,
    accent: '#ffbe6b',
  },
  {
    key: 'text',
    label: 'AI 文字创作',
    short: 'AI 文字',
    mini: '文字',
    en: 'TEXT',
    blurb: '同一个主题，换一种文体，就是另一种想象。',
    tags: ['AI 短诗', 'AI 故事', 'AI 趣味文案', 'AI 创意表达', '同主题多风格'],
    icon: PenLine,
    accent: '#ff9fb8',
  },
  {
    key: 'music',
    label: 'AI 音乐创作',
    short: 'AI 音乐',
    mini: '音乐',
    en: 'MUSIC',
    blurb: '旋律、氛围与封面，一起构成一段声音的想象。',
    tags: ['AI 原创歌曲', 'AI 纯音乐', 'AI 音乐封面', '多风格音乐成果'],
    icon: Music,
    accent: '#b8a8ff',
  },
  {
    key: 'idea',
    label: 'AI 奇思妙想',
    short: 'AI 脑洞',
    mini: '脑洞',
    en: 'IDEAS',
    blurb: '不那么「正确」的脑洞，才是想象力最野的地方。',
    tags: ['AI 脑洞作品', '创意实验', '超现实艺术', '趣味生成结果'],
    icon: Sparkles,
    accent: '#7fe3c4',
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
