/**
 * AI 造梦事务所 · 自托管服务（零依赖）
 *
 * 一台机器同时干两件事：
 *   1. 托管前端静态文件（dist/），SPA 路由回退到 index.html；
 *   2. 提供共享计票接口，票数存在一个 JSON 文件里，重启不丢。
 *
 * 接口：
 *   GET  /votes            → { counts: { [workId]: number }, total: number }
 *   POST /vote  { id }     → 同上（+1 之后的最新计数）
 *   GET  /healthz          → { ok: true, votes: n }
 *
 * 启动：
 *   PORT=8080 node server/vote-server.mjs
 *   # 可选环境变量：PORT / STATIC_DIR / DATA_FILE
 *
 * 说明：
 * - 没有第三方依赖，Node 18+ 直接跑；
 * - 写入做了防抖 + 原子替换（先写 .tmp 再 rename），断电不会写坏 JSON；
 * - 同一 IP 每分钟最多 60 次投票请求，防止误触/刷票；
 * - 静态资源带内容指纹的走长缓存，index.html 不缓存。
 */
import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname, extname, join, normalize, resolve, sep } from 'node:path'

const PORT = Number(process.env.PORT ?? 8080)
const HOST = process.env.HOST ?? '0.0.0.0'
const ROOT = resolve(process.env.STATIC_DIR ?? 'dist')
const DATA_FILE = resolve(process.env.DATA_FILE ?? 'votes.json')

/* ---------------- 票数存储 ---------------- */

let counts = {}
let total = 0
let saveTimer = null
let saving = null

async function loadCounts() {
  try {
    const raw = await readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    counts = {}
    total = 0
    for (const [id, value] of Object.entries(parsed.counts ?? {})) {
      if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
        counts[id] = Math.trunc(value)
        total += counts[id]
      }
    }
    console.log(`已载入票数：${Object.keys(counts).length} 件作品 / ${total} 票`)
  } catch {
    console.log('没有历史数据，从 0 开始')
  }
}

/** 防抖落盘：300ms 内多次投票只写一次 */
function scheduleSave() {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    void flush()
  }, 300)
}

async function flush() {
  if (saving) return saving
  const payload = JSON.stringify({ counts, total, updatedAt: new Date().toISOString() })
  saving = (async () => {
    try {
      await mkdir(dirname(DATA_FILE), { recursive: true })
      const tmp = `${DATA_FILE}.tmp`
      await writeFile(tmp, payload, 'utf8')
      await rename(tmp, DATA_FILE)
    } catch (error) {
      console.error('写入票数失败：', error.message)
    } finally {
      saving = null
    }
  })()
  return saving
}

/* ---------------- 简易限频 ---------------- */

const RATE_WINDOW = 60_000
const RATE_LIMIT = 60
const hits = new Map()

function tooMany(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW) {
    hits.set(ip, { start: now, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of hits) {
    if (now - entry.start > RATE_WINDOW) hits.delete(ip)
  }
}, 60_000).unref()

/* ---------------- 工具 ---------------- */

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function json(response, status, data) {
  const body = JSON.stringify(data)
  response.writeHead(status, {
    ...CORS,
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  })
  response.end(body)
}

function readBody(request, limit = 2048) {
  return new Promise((resolveBody, rejectBody) => {
    let size = 0
    const chunks = []
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        rejectBody(new Error('body too large'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')))
    request.on('error', rejectBody)
  })
}

/** 路径穿越防护 */
function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0])
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  const full = join(root, normalized)
  if (full !== root && !full.startsWith(root + sep)) return null
  return full
}

async function sendFile(request, response, filePath) {
  try {
    const info = await stat(filePath)
    if (!info.isFile()) return false
    const ext = extname(filePath).toLowerCase()
    const immutable = filePath.includes(`${sep}assets${sep}`)
    response.writeHead(200, {
      'Content-Type': TYPES[ext] ?? 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    })
    if (request.method === 'HEAD') {
      response.end()
      return true
    }
    createReadStream(filePath).pipe(response)
    return true
  } catch {
    return false
  }
}

/* ---------------- 请求处理 ---------------- */

const server = createServer(async (request, response) => {
  const ip = request.socket.remoteAddress ?? 'unknown'
  const url = new URL(request.url ?? '/', 'http://localhost')
  const path = url.pathname

  if (request.method === 'OPTIONS') {
    response.writeHead(204, CORS)
    response.end()
    return
  }

  if (path === '/healthz') {
    json(response, 200, { ok: true, votes: total, works: Object.keys(counts).length })
    return
  }

  if (path === '/votes' && request.method === 'GET') {
    json(response, 200, { counts, total })
    return
  }

  if (path === '/vote' && request.method === 'POST') {
    if (tooMany(ip)) {
      json(response, 429, { error: 'too many requests' })
      return
    }
    let body
    try {
      body = JSON.parse(await readBody(request))
    } catch {
      json(response, 400, { error: 'invalid body' })
      return
    }
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(id)) {
      json(response, 400, { error: 'invalid id' })
      return
    }
    counts[id] = (counts[id] ?? 0) + 1
    total += 1
    scheduleSave()
    json(response, 200, { counts, total })
    return
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    json(response, 405, { error: 'method not allowed' })
    return
  }

  /* 静态资源 */
  const target = safeJoin(ROOT, path)
  if (target && (await sendFile(request, response, target))) return

  /* SPA 回退：非资源路径一律交给 index.html */
  const indexFile = join(ROOT, 'index.html')
  if (await sendFile(request, response, indexFile)) return

  json(response, 404, { error: 'not found' })
})

await loadCounts()
server.listen(PORT, HOST, () => {
  console.log(`静态目录：${ROOT}`)
  console.log(`票数文件：${DATA_FILE}`)
  console.log(`服务已启动：http://${HOST}:${PORT}`)
})

const shutdown = async () => {
  console.log('\n正在退出，写入票数…')
  await flush()
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000).unref()
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
