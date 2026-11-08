/**
 * AI 造梦事务所 · 腾讯云 SCF 计票函数
 *
 * 形态：云函数（Node.js 18）+ 函数 URL（HTTPS 直接可访问）+ COS 存一个 JSON。
 *
 * 接口（与前端约定一致）：
 *   GET  /votes        → { counts: { [workId]: number }, total: number }
 *   POST /vote {id}    → 同上（+1 之后）
 *   GET  /healthz      → { ok: true, votes, works }
 *
 * 需要配置的环境变量：
 *   TENCENT_SECRET_ID / TENCENT_SECRET_KEY   子账号密钥（只给 COS 读写权限即可）
 *   COS_BUCKET      例如 dream-vote-1250000000
 *   COS_REGION      例如 ap-guangzhou
 *   COS_KEY         可选，默认 dream-votes.json
 *
 * ⚠️ 并发：函数默认可能并行执行，多人同时投票会「读-改-写」互相覆盖。
 *    建议把函数的「并发上限」设为 1（单实例串行），几百票的现场完全够用。
 */
import COS from 'cos-nodejs-sdk-v5'

const BUCKET = process.env.COS_BUCKET ?? ''
const REGION = process.env.COS_REGION ?? ''
const KEY = process.env.COS_KEY ?? 'dream-votes.json'

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID ?? '',
  SecretKey: process.env.TENCENT_SECRET_KEY ?? '',
})

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function reply(statusCode, data) {
  return {
    statusCode,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    body: JSON.stringify(data),
  }
}

function normalize(raw) {
  const counts = {}
  let total = 0
  for (const [id, value] of Object.entries(raw?.counts ?? {})) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      counts[id] = Math.trunc(value)
      total += counts[id]
    }
  }
  return { counts, total }
}

async function readCounts() {
  try {
    const res = await cos.getObject({ Bucket: BUCKET, Region: REGION, Key: KEY })
    const text = res.Body.toString('utf8')
    return normalize(JSON.parse(text))
  } catch (error) {
    // 桶里还没有这个对象时，当作 0 开始
    if (String(error?.statusCode) === '404' || error?.code === 'NoSuchKey') return { counts: {}, total: 0 }
    throw error
  }
}

async function writeCounts(data) {
  await cos.putObject({
    Bucket: BUCKET,
    Region: REGION,
    Key: KEY,
    Body: JSON.stringify({ ...data, updatedAt: new Date().toISOString() }),
    ContentType: 'application/json; charset=utf-8',
  })
}

/** 兼容 API 网关 v1/v2 与函数 URL 的 event 形状 */
function parseRequest(event) {
  const method = (event.httpMethod ?? event.requestContext?.http?.method ?? 'GET').toUpperCase()
  let path = event.path ?? event.rawPath ?? '/'
  // 函数 URL 有时会把路径前缀带上，只取最后一段
  if (path.startsWith('/')) {
    // 保持不变
  } else {
    path = `/${path}`
  }
  const bodyText = event.isBase64Encoded
    ? Buffer.from(event.body ?? '', 'base64').toString('utf8')
    : (event.body ?? '')

  let body = null
  if (bodyText) {
    try {
      body = JSON.parse(bodyText)
    } catch {
      body = null
    }
  }

  const ip =
    event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
    event.requestContext?.http?.sourceIp ??
    'unknown'

  return { method, path, body, ip }
}

export async function main_handler(event) {
  const { method, path, body } = parseRequest(event)

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  if (path === '/healthz') {
    const data = await readCounts()
    return reply(200, { ok: true, votes: data.total, works: Object.keys(data.counts).length })
  }

  if (path === '/votes' && method === 'GET') {
    return reply(200, await readCounts())
  }

  if (path === '/vote' && method === 'POST') {
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(id)) {
      return reply(400, { error: 'invalid id' })
    }
    const data = await readCounts()
    data.counts[id] = (data.counts[id] ?? 0) + 1
    data.total += 1
    await writeCounts(data)
    return reply(200, data)
  }

  return reply(404, { error: 'not found' })
}

/* 兼容 handler 名写成 main_handler 之外的导出（有些模板要求 index.main_handler） */
export default main_handler
