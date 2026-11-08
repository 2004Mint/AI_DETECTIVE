/**
 * AI 造梦事务所 · 数据模型
 *
 * 设计原则：作品数据与页面组件完全分离。
 * - 页面只消费这里定义的类型，不关心数据从哪里来；
 * - 未来接入后端时，只要让接口返回同样的结构即可，页面不用改。
 *
 * 内容放置位置见 `docs/DREAM-STUDIO.md`。
 */

/** 四个创作分类的键（与文件系统、路由参数一致） */
export type DreamCategoryKey = 'visual' | 'text' | 'music' | 'idea'

/** 详情页媒体类型：图片 / 文字 / 音频 */
export type DreamMediaKind = 'image' | 'text' | 'audio'

/** 封面比例（瀑布流靠它决定卡片高度，避免图片加载前后跳版） */
export type DreamCoverAspect = 'portrait' | 'tall' | 'square' | 'landscape'

/**
 * 一件展出作品。
 *
 * 除 `id` / `title` / `category` 外全部可选：
 * 现场收集素材时往往先有图和标题，提示词、创作思路可以后补，
 * 缺字段时页面会自动降级（例如没有封面就用分类渐变占位图）。
 */
export interface DreamWork {
  /** 唯一标识，用于路由 `/dream-studio/work/:id` 与投票统计，建议用英文短横线命名 */
  id: string
  /** 作品标题 */
  title: string
  /** 所属分类 */
  category: DreamCategoryKey
  /** 二级标签，例如「AI 动漫插画」「AI 短诗」 */
  tag?: string
  /**
   * 封面图地址：
   * - 推荐只写文件名，例如 `visual-01.webp`，会自动指向 `public/dream/works/`
   * - 也支持完整 URL（http(s)://）与 data URL
   * - 留空 = 使用分类渐变占位图（不会有 404）
   */
  cover?: string
  /** 封面原始比例，缺省按 id 稳定推导 */
  coverAspect?: DreamCoverAspect
  /** 详情页媒体类型，缺省按分类推断：text → 文字、music → 音频、其余 → 图片 */
  media?: DreamMediaKind
  /** 创作简介（卡片摘要 + 详情页正文首段） */
  description?: string
  /** 作品正文：文字类作品（短诗 / 故事 / 文案）用 */
  body?: string
  /** 使用的 AI 工具，例如「Midjourney v6」「即梦」「Suno v3」 */
  tool?: string
  /** 原始创作提示词（Prompt） */
  prompt?: string
  /** 创作思路：为什么这样想、怎么调出来的 */
  idea?: string
  /** 创作者署名；留空显示「匿名社员」 */
  creator?: string
  /** 初始票数（往期累计 / 线下统计），本机投票会在它之上叠加 */
  voteCount?: number
  /** 是否精选（首页精选区展示） */
  featured?: boolean
  /** 创作时间，ISO 字符串，例如 `2026-11-01T10:00:00+08:00` */
  createdAt?: string
  /** 音频地址：推荐只写文件名，自动指向 `public/dream/audio/` */
  audioUrl?: string
  /** 音频时长（秒），用于音频加载前的时长占位 */
  duration?: number
  /** 自由标签，详情页展示 */
  tags?: string[]
}

/** 留言审核状态：`pending` 待审核、`approved` 已通过 */
export type DreamMessageStatus = 'pending' | 'approved'

/** 一条创意留言（只存在本机浏览器，未接入服务端） */
export interface DreamMessage {
  id: string
  /** 留言正文（纯文本，渲染时由 Vue 自动转义） */
  content: string
  /** 昵称（选填，可为空字符串） */
  nickname: string
  /** 关联作品 id（选填） */
  workId?: string
  /** 关联作品标题快照（作品改名/删除后留言仍然可读） */
  workTitle?: string
  /** 提交时间 ISO 字符串 */
  createdAt: string
  /** 审核状态：预留管理员审核能力 */
  status: DreamMessageStatus
}

/** 表单提交结果 */
export type DreamSubmitResult =
  | { ok: true; message: DreamMessage }
  | { ok: false; error: string }

/**
 * 站点文案参数（后台「站点参数」里可以改，导出后写入 `src/data/dream/site.ts`）。
 * 只放真正会展示在页面上的文字，避免配置项变成摆设。
 */
export interface DreamSiteConfig {
  /** 首页大标题（同时用于顶栏品牌） */
  title: string
  /** 首页副标题 */
  subtitle: string
  /** 页脚社团署名 */
  footerOrg: string
  /** 页脚补充说明（合规提示） */
  footerNote: string
}
