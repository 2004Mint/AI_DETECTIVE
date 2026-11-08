/**
 * AI 造梦事务所 · 共享计票后端（Cloudflare Worker + KV）
 *
 * 作用：让所有人看到同一份人气榜，而不是各看各的本机记录。
 *
 * 接口：
 *   GET  /votes            → { counts: { [workId]: number }, total: number }
 *   POST /vote  { id }     → 同上（+1 之后的最新计数）
 *
 * 部署（约 5 分钟）：
 *   1. npm i -g wrangler && wrangler login
 *   2. wrangler kv namespace create VOTES        # 复制输出的 id
 *   3. 把 id 填进 wrangler.toml
 *   4. wrangler deploy
 *   5. 在前端设置 VITE_VOTE_API=https://<你的子域>.workers.dev
 *
 * 说明：
 * - 计数存在 KV 的单个 key 里（读-改-写）。校园活动这种量级（几百票）足够；
 *   如果以后要承受高并发，换成 Durable Object 或 D1 即可，接口不用变。
 * - 没有做身份校验：同一件作品在服务端可以被重复投。防刷靠活动场景与人工值守，
 *   需要更严格时可以加 Turnstile 或按 IP 限频。
 */

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function readCounts(env) {
  const raw = await env.VOTES.get('counts')
  if (!raw) return { counts: {}, total: 0 }
  try {
    const parsed = JSON.parse(raw)
    const counts = {}
    let total = 0
    for (const [id, value] of Object.entries(parsed.counts ?? {})) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        counts[id] = Math.trunc(value)
        total += counts[id]
      }
    }
    return { counts, total }
  } catch {
    return { counts: {}, total: 0 }
  }
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS })
    }

    const { pathname } = new URL(request.url)

    if (pathname === '/votes' && request.method === 'GET') {
      return json(await readCounts(env))
    }

    if (pathname === '/vote' && request.method === 'POST') {
      const body = await request.json().catch(() => null)
      const id = body && typeof body.id === 'string' ? body.id.trim() : ''
      if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(id)) {
        return json({ error: 'invalid id' }, 400)
      }

      const data = await readCounts(env)
      data.counts[id] = (data.counts[id] ?? 0) + 1
      data.total += 1
      await env.VOTES.put('counts', JSON.stringify(data))
      return json(data)
    }

    return json({ error: 'not found' }, 404)
  },
}
