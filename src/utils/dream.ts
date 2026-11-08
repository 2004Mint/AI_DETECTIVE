/**
 * AI 造梦事务所 · 纯函数工具
 *
 * 页面里的排序、筛选、投票合计、素材路径解析、留言校验都在这里，
 * 组件只做展示，方便后续换数据源（换成接口时改这里即可）。
 */
import { DREAM_CATEGORIES } from '@/data/dream/categories'
import { DREAM_WORKS } from '@/data/dream/works'
import type {
  DreamCategoryKey,
  DreamCoverAspect,
  DreamMediaKind,
  DreamWork,
} from '@/types/dream'

/* ---------------- 素材路径 ---------------- */

/**
 * 把作品里写的素材地址解析成浏览器可用的 URL。
 *
 * 支持三种写法：
 * 1. 只写文件名 → 自动补到 `public/dream/<folder>/`，例如 `visual-01.webp`
 * 2. 带子目录/相对路径 → 补到 `public/dream/` 下，例如 `works/2026/a.webp`
 * 3. 完整 URL（http(s)://、data:、blob:）或 `/` 开头的站点绝对路径 → 原样返回
 *
 * 用 `import.meta.env.BASE_URL` 拼接，所以 GitHub Pages 子路径部署也不会 404。
 */
function resolveDreamAsset(path: string | undefined, folder: 'works' | 'audio'): string {
  if (!path) return ''
  const value = path.trim()
  if (!value) return ''
  if (/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
    return value
  }
  if (value.startsWith('/')) return value
  const base = import.meta.env.BASE_URL
  const normalized = value.replace(/^\.\//, '')
  const relative = normalized.includes('/') ? normalized : `${folder}/${normalized}`
  return `${base}dream/${relative}`
}

/** 封面图地址（默认落在 public/dream/works/） */
export function dreamCover(work: DreamWork): string {
  return resolveDreamAsset(work.cover, 'works')
}

/** 音频地址（默认落在 public/dream/audio/） */
export function dreamAudio(work: DreamWork): string {
  return resolveDreamAsset(work.audioUrl, 'audio')
}

/* ---------------- 作品集合 ---------------- */

/** 全部作品（数据文件的只读视图） */
export function allWorks(): readonly DreamWork[] {
  return DREAM_WORKS
}

/** 按 id 查作品；详情页深链刷新时也走这里 */
export function findWork(id: string | undefined | null): DreamWork | undefined {
  if (!id) return undefined
  return DREAM_WORKS.find((work) => work.id === id)
}

/** 某分类下的作品（新作品在前） */
export function worksIn(category: DreamCategoryKey): DreamWork[] {
  return newestWorks(DREAM_WORKS.filter((work) => work.category === category))
}

/** 精选作品（首页展示，最多 limit 件） */
export function featuredWorks(limit = 2): DreamWork[] {
  return DREAM_WORKS.filter((work) => work.featured).slice(0, limit)
}

/** 按创作时间倒序（没有时间的排在最后，保持数据顺序） */
export function newestWorks(works: readonly DreamWork[]): DreamWork[] {
  return [...works].sort((a, b) => timeValue(b) - timeValue(a))
}

/* ---------------- 投票与排行榜 ---------------- */

/** 本机投给这件作品的票数（每人每件最多 1 票） */
export function localVotesOf(localVotes: Readonly<Record<string, number>>, workId: string): number {
  return localVotes[workId] ?? 0
}

/** 作品总票数 = 数据里的初始票数 + 本机投票 */
export function voteTotal(work: DreamWork, localVotes: Readonly<Record<string, number>>): number {
  return (work.voteCount ?? 0) + localVotesOf(localVotes, work.id)
}

export interface RankedWork {
  work: DreamWork
  votes: number
  /** 名次，从 1 开始 */
  rank: number
}

/**
 * 人气榜排序：票数降序；票数相同按创作时间新的在前，再按标题稳定排序。
 * 不修改传入数组。
 */
export function rankWorks(
  works: readonly DreamWork[],
  localVotes: Readonly<Record<string, number>>,
): RankedWork[] {
  const sorted = [...works].sort((a, b) => {
    const diff = voteTotal(b, localVotes) - voteTotal(a, localVotes)
    if (diff !== 0) return diff
    const timeDiff = timeValue(b) - timeValue(a)
    if (timeDiff !== 0) return timeDiff
    return a.title.localeCompare(b.title, 'zh-Hans-CN')
  })
  return sorted.map((work, index) => ({
    work,
    votes: voteTotal(work, localVotes),
    rank: index + 1,
  }))
}

/** 最热门的若干件作品 */
export function hottestWorks(
  works: readonly DreamWork[],
  localVotes: Readonly<Record<string, number>>,
  limit = 6,
): DreamWork[] {
  return rankWorks(works, localVotes)
    .slice(0, limit)
    .map((item) => item.work)
}

/* ---------------- 展示辅助 ---------------- */

/** 创作者署名，空值兜底 */
export function creatorOf(work: DreamWork): string {
  const name = work.creator?.trim()
  return name && name.length > 0 ? name : '匿名社员'
}

/** 详情页媒体类型：显式声明优先，否则按分类推断 */
export function mediaOf(work: DreamWork): DreamMediaKind {
  if (work.media) return work.media
  if (work.category === 'text') return 'text'
  if (work.category === 'music') return 'audio'
  return 'image'
}

/** 封面比例：显式声明优先，否则按 id 稳定推导（同一作品每次渲染高度一致） */
export function coverAspectOf(work: DreamWork): DreamCoverAspect {
  if (work.coverAspect) return work.coverAspect
  const hash = hashOf(work.id)
  const pool: DreamCoverAspect[] = ['portrait', 'square', 'landscape', 'tall', 'portrait', 'square']
  return pool[hash % pool.length] ?? 'square'
}

/** 比例 → Tailwind 类（必须是完整字面量，Tailwind 才能识别） */
export function aspectClassOf(aspect: DreamCoverAspect): string {
  switch (aspect) {
    case 'portrait':
      return 'aspect-[3/4]'
    case 'tall':
      return 'aspect-[2/3]'
    case 'landscape':
      return 'aspect-[4/3]'
    default:
      return 'aspect-square'
  }
}

/** 展签上的日期：2026.11.01；无日期显示「日期待补」 */
export function formatWorkDate(iso: string | undefined): string {
  if (!iso) return '日期待补'
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return '日期待补'
  const date = new Date(time)
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

/** 留言时间：刚刚 / 3 分钟前 / 2 小时前 / 11.01 */
export function formatRelativeTime(iso: string): string {
  const time = Date.parse(iso)
  if (Number.isNaN(time)) return ''
  const diff = Date.now() - time
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  const date = new Date(time)
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}`
}

/** 分类数量统计，用于首页导航 */
export function categoryCounts(): Record<DreamCategoryKey, number> {
  const counts = {
    visual: 0,
    text: 0,
    music: 0,
    idea: 0,
  } satisfies Record<DreamCategoryKey, number>

  for (const work of DREAM_WORKS) {
    if (work.category in counts) counts[work.category] += 1
  }
  return counts
}

/** 展览总数据（首页统计条用） */
export function exhibitionStats(localVotes: Readonly<Record<string, number>>) {
  const baseVotes = DREAM_WORKS.reduce((sum, work) => sum + (work.voteCount ?? 0), 0)
  const localTotal = Object.values(localVotes).reduce((sum, n) => sum + n, 0)
  return {
    works: DREAM_WORKS.length,
    categories: DREAM_CATEGORIES.length,
    votes: baseVotes + localTotal,
  }
}

/* ---------------- 留言校验 ---------------- */

/** 留言最短 / 最长字数（按字符计，emoji 算 1 个） */
export const MESSAGE_MIN = 4
export const MESSAGE_MAX = 120
/** 昵称最长字数 */
export const NICKNAME_MAX = 12

export interface MessageDraft {
  content: string
  nickname?: string
}

export type MessageValidation =
  | { ok: true; content: string; nickname: string }
  | { ok: false; error: string }

/** 去掉控制字符与零宽字符，并统一换行（防止粘贴进来的脏字符撑破排版） */
function cleanText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function charLength(value: string): number {
  return [...value].length
}

/**
 * 留言校验。
 * 只做「长度 + 空内容」校验，不收集任何个人信息；
 * 内容按纯文本存储，渲染时统一走 Vue 插值（自动转义），不会执行 HTML。
 */
export function validateMessage(draft: MessageDraft): MessageValidation {
  const content = cleanText(draft.content)
  const nickname = cleanText(draft.nickname ?? '')

  if (charLength(content) < MESSAGE_MIN) {
    return { ok: false, error: `多说几个字吧（至少 ${MESSAGE_MIN} 个字）` }
  }
  if (charLength(content) > MESSAGE_MAX) {
    return { ok: false, error: `留言最多 ${MESSAGE_MAX} 个字，短的更打动人` }
  }
  if (charLength(nickname) > NICKNAME_MAX) {
    return { ok: false, error: `昵称最多 ${NICKNAME_MAX} 个字` }
  }
  return { ok: true, content, nickname }
}

/* ---------------- 内部 ---------------- */

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function timeValue(work: DreamWork): number {
  if (!work.createdAt) return 0
  const time = Date.parse(work.createdAt)
  return Number.isNaN(time) ? 0 : time
}

function hashOf(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 997_307
  }
  return hash
}
