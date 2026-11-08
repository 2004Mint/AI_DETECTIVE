/**
 * AI 造梦事务所 · 腾讯云 SCF 计票函数（CommonJS）
 *
 * 形态：云函数（Node.js 18）+ 函数 URL（HTTPS）+ COS 存一个 JSON。
 *
 * 为什么用 CommonJS：SCF 的 Node 运行时按 CommonJS 加载入口文件，
 * ESM（.mjs / import）在部分运行时上会直接报错，这里用 index.js + exports 最稳。
 *
 * 接口：
 *   GET  /votes        → { counts: { [workId]: number }, total: number }
 *   POST /vote {id}    → 同上（+1 之后）
 *   GET  /healthz      → { ok: true, votes, works }
 *
 * 环境变量：
 *   TENCENT_SECRET_ID / TENCENT_SECRET_KEY   子账号密钥（只给 COS 读写权限）
 *   COS_BUCKET      例如 dream-vote-1250000000
 *   COS_REGION      例如 ap-guangzhou
 *   COS_KEY         可选，默认 dream-votes.json
 *
 * ⚠️ 并发：把函数的「并发上限」设为 1，避免多人同时投票时读-改-写互相覆盖。
 */
'use strict'

const COS = require('cos-nodejs-sdk-v5')

const BUCKET = process.env.COS_BUCKET || ''
const REGION = process.env.COS_REGION || ''
const KEY = process.env.COS_KEY || 'dream-votes.json'

const cos = new COS({
  SecretId: process.env.TENCENT_SECRET_ID || '',
  SecretKey: process.env.TENCENT_SECRET_KEY || '',
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
    headers: {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(data),
  }
}

function normalize(raw) {
  const counts = {}
  let total = 0
  const source = raw && raw.counts ? raw.counts : {}
  for (const id of Object.keys(source)) {
    const value = source[id]
    if (typeof value === 'number' && isFinite(value) && value > 0) {
      counts[id] = Math.trunc(value)
      total += counts[id]
    }
  }
  return { counts, total }
}

function readCounts() {
  return new Promise((resolve, reject) => {
    cos.getObject({ Bucket: BUCKET, Region: REGION, Key: KEY }, (error, data) => {
      if (error) {
        // 桶里还没有这个对象时，当作从 0 开始
        if (String(error.statusCode) === '404' || error.code === 'NoSuchKey') {
          resolve({ counts: {}, total: 0 })
          return
        }
        reject(error)
        return
      }
      try {
        resolve(normalize(JSON.parse(data.Body.toString('utf8'))))
      } catch {
        resolve({ counts: {}, total: 0 })
      }
    })
  })
}

function writeCounts(payload) {
  return new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: BUCKET,
        Region: REGION,
        Key: KEY,
        Body: JSON.stringify({
          counts: payload.counts,
          total: payload.total,
          updatedAt: new Date().toISOString(),
        }),
        ContentType: 'application/json; charset=utf-8',
      },
      (error) => (error ? reject(error) : resolve()),
    )
  })
}

/** 兼容 API 网关 v1/v2 与函数 URL 的 event 形状 */
function parseRequest(event) {
  const source = event || {}
  const method = String(
    source.httpMethod || (source.requestContext && source.requestContext.http && source.requestContext.http.method) || 'GET',
  ).toUpperCase()

  let path = source.path || source.rawPath || '/'
  if (path.charAt(0) !== '/') path = '/' + path

  const bodyText = source.isBase64Encoded
    ? Buffer.from(source.body || '', 'base64').toString('utf8')
    : source.body || ''

  let body = null
  if (bodyText) {
    try {
      body = JSON.parse(bodyText)
    } catch {
      body = null
    }
  }

  return { method, path, body }
}

async function main_handler(event) {
  const { method, path, body } = parseRequest(event)

  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  if (path === '/healthz' || path === '/') {
    const data = await readCounts()
    return reply(200, { ok: true, votes: data.total, works: Object.keys(data.counts).length })
  }

  if (path === '/votes' && method === 'GET') {
    return reply(200, await readCounts())
  }

  if (path === '/vote' && method === 'POST') {
    const id = body && typeof body.id === 'string' ? body.id.trim() : ''
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/i.test(id)) {
      return reply(400, { error: 'invalid id' })
    }
    const data = await readCounts()
    data.counts[id] = (data.counts[id] || 0) + 1
    data.total += 1
    await writeCounts(data)
    return reply(200, data)
  }

  return reply(404, { error: 'not found' })
}

module.exports = { main_handler }
