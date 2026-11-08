/**
 * AI 造梦事务所 · 可选的共享投票后端
 *
 * 默认不配置：票数只存在本机 localStorage。
 * 配置了 `VITE_VOTE_API`（例如自建的 Cloudflare Worker，代码见 workers/vote-worker.js），
 * 则票数来自全站共享计数，所有人看到的是同一份人气榜。
 *
 * 接口约定（两个端点，都返回 JSON）：
 *   GET  {BASE}/votes        → { counts: { [workId]: number }, total: number }
 *   POST {BASE}/vote  {id}   → 同上（成功 +1 后的最新计数）
 *
 * 所有请求都有超时和形状校验；失败只会让页面退回本机模式，不会白屏。
 */

/**
 * 后端地址；留空 = 纯本机投票。
 * 写成 `self` / `.` / `/` 表示与页面同源——自托管（server/vote-server.mjs）时用这个。
 */
const RAW = (import.meta.env.VITE_VOTE_API ?? '').trim()
const SAME_ORIGIN = RAW === 'self' || RAW === '.' || RAW === '/'
const BASE = SAME_ORIGIN ? '' : RAW.replace(/\/+$/, '')

/** 请求超时（毫秒）：现场网络差时不要一直转圈 */
const TIMEOUT = 6000

export interface VoteTotals {
  /** 作品 id → 票数 */
  counts: Record<string, number>
  /** 总票数 */
  total: number
}

/** 是否接入了共享后端（同源也算） */
export function hasRemoteVotes(): boolean {
  return SAME_ORIGIN || BASE.length > 0
}

/** 带超时的 fetch */
async function request(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT)
  try {
    return await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    })
  } finally {
    window.clearTimeout(timer)
  }
}

/** 校验并清洗后端返回，脏字段直接丢掉 */
function parseTotals(raw: unknown): VoteTotals {
  if (typeof raw !== 'object' || raw === null) throw new Error('bad response')
  const value = raw as Record<string, unknown>
  const counts: Record<string, number> = {}
  if (typeof value.counts === 'object' && value.counts !== null) {
    for (const [key, count] of Object.entries(value.counts as Record<string, unknown>)) {
      if (typeof count === 'number' && Number.isFinite(count) && count > 0) {
        counts[key] = Math.trunc(count)
      }
    }
  }
  const total =
    typeof value.total === 'number' && Number.isFinite(value.total)
      ? Math.trunc(value.total)
      : Object.values(counts).reduce((sum, count) => sum + count, 0)
  return { counts, total }
}

/** 拉取全站票数 */
export async function fetchVoteTotals(): Promise<VoteTotals> {
  const response = await request('/votes')
  if (!response.ok) throw new Error(`votes ${response.status}`)
  return parseTotals(await response.json())
}

/** 给某件作品投票（服务端负责去重） */
export async function sendVote(workId: string): Promise<VoteTotals> {
  const response = await request('/vote', {
    method: 'POST',
    body: JSON.stringify({ id: workId }),
  })
  if (!response.ok) throw new Error(`vote ${response.status}`)
  return parseTotals(await response.json())
}
