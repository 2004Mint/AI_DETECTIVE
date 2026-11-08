/**
 * AI 造梦事务所 · 本机持久化
 *
 * 现状：项目是纯静态站，没有后端。投票与留言都只存在浏览器 localStorage 里，
 * 换一台设备 / 清缓存就会丢。这是**已知限制**，页面底部与投票区都有提示。
 *
 * 为什么要单独一层：以后接入后端（例如社团自建接口）时，只需要改这个文件的
 * 读写实现，Pinia store 与页面都不用动。
 *
 * 存储结构（键 `ai-dream-studio:v1`）：
 * ```json
 * { "votes": { "visual-01": 1 }, "messages": [ { "id": "...", "content": "...", ... } ] }
 * ```
 * 读取时会做宽松校验，脏数据只会被丢掉，不会让页面崩掉。
 */
import type { DreamMessage, DreamMessageStatus } from '@/types/dream'

export const DREAM_STORAGE_KEY = 'ai-dream-studio:v1'

/** 本机保存的全部数据 */
export interface DreamSnapshot {
  /** 作品 id → 本机票数（目前每人每件 1 票，所以只会有 0/1） */
  votes: Record<string, number>
  /** 创意留言（新的在前） */
  messages: DreamMessage[]
}

/** 最多保留多少条留言，避免 localStorage 无限膨胀 */
const MAX_STORED_MESSAGES = 200

function emptyVotes(): Record<string, number> {
  return {}
}

function emptySnapshot(): DreamSnapshot {
  return { votes: emptyVotes(), messages: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isMessageStatus(value: unknown): value is DreamMessageStatus {
  return value === 'pending' || value === 'approved'
}

function sanitizeVotes(input: unknown): Record<string, number> {
  const votes = emptyVotes()
  if (!isRecord(input)) return votes
  for (const [id, count] of Object.entries(input)) {
    if (!id || typeof count !== 'number' || !Number.isFinite(count)) continue
    const safe = Math.max(0, Math.floor(count))
    if (safe > 0) votes[id] = safe
  }
  return votes
}

function sanitizeMessages(input: unknown): DreamMessage[] {
  if (!Array.isArray(input)) return []
  const messages: DreamMessage[] = []
  for (const item of input) {
    if (!isRecord(item)) continue
    const { id, content, createdAt } = item
    if (typeof id !== 'string' || !id) continue
    if (typeof content !== 'string' || !content) continue
    if (typeof createdAt !== 'string' || !createdAt) continue

    messages.push({
      id,
      content,
      createdAt,
      nickname: typeof item.nickname === 'string' ? item.nickname : '',
      workId: typeof item.workId === 'string' && item.workId ? item.workId : undefined,
      workTitle: typeof item.workTitle === 'string' && item.workTitle ? item.workTitle : undefined,
      status: isMessageStatus(item.status) ? item.status : 'pending',
    })
    if (messages.length >= MAX_STORED_MESSAGES) break
  }
  return messages
}

/** 读取本机数据；任何异常都退化成空数据，保证页面可用 */
export function readDreamSnapshot(): DreamSnapshot {
  try {
    const raw = localStorage.getItem(DREAM_STORAGE_KEY)
    if (!raw) return emptySnapshot()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return emptySnapshot()
    return {
      votes: sanitizeVotes(parsed.votes),
      messages: sanitizeMessages(parsed.messages),
    }
  } catch {
    return emptySnapshot()
  }
}

/** 写入本机数据；写入失败（隐私模式 / 配额满）时静默忽略，不影响交互 */
export function writeDreamSnapshot(snapshot: DreamSnapshot): void {
  try {
    localStorage.setItem(
      DREAM_STORAGE_KEY,
      JSON.stringify({
        votes: snapshot.votes,
        messages: snapshot.messages.slice(0, MAX_STORED_MESSAGES),
      }),
    )
  } catch {
    /* 忽略：本模块的投票/留言本来就是「尽力而为」的现场体验 */
  }
}

/** 清空本机数据（调试 / 换展品时用：控制台执行 `clearDreamSnapshot()` 需先自行暴露） */
export function clearDreamSnapshot(): void {
  try {
    localStorage.removeItem(DREAM_STORAGE_KEY)
  } catch {
    /* 忽略 */
  }
}
