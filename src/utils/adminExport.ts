/**
 * 后台 · 导出
 *
 * 把本机草稿变成可以提交进仓库的东西：
 * - `works.ts` / `site.ts` 源码；
 * - 新上传素材的 ZIP（works/ 与 audio/，解压到 public/dream/ 即可）；
 * - 素材缺失清单（哪些作品引用了仓库里已有的图，不会被重复打包）。
 */
import type { DreamSiteConfig, DreamWork } from '@/types/dream'
import { getAsset } from '@/utils/adminStorage'
import { createZip } from '@/utils/zip'
import type { ZipEntry } from '@/utils/zip'

function timestamp(): string {
  return new Date().toLocaleString('zh-CN', { hour12: false })
}

/** 生成 TS 字面量：单行用单引号，含换行用模板字符串 */
function quote(value: string): string {
  if (value.includes('\n')) {
    return `\`${value.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\``
  }
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function stringField(name: string, value: string | undefined): string | null {
  if (value === undefined) return null
  if (!value.trim()) return null
  return `    ${name}: ${quote(value)},`
}

function numberField(name: string, value: number | undefined): string | null {
  if (value === undefined || Number.isNaN(value)) return null
  return `    ${name}: ${value},`
}

function booleanField(name: string, value: boolean | undefined): string | null {
  if (value === undefined) return null
  return `    ${name}: ${value},`
}

function tagsField(tags: string[] | undefined): string | null {
  if (!tags || tags.length === 0) return null
  return `    tags: [${tags.map((tag) => quote(tag)).join(', ')}],`
}

/** 作品数组 → works.ts 全文 */
export function serializeWorks(works: readonly DreamWork[]): string {
  const lines: string[] = [
    '/**',
    ' * AI 造梦事务所 · 作品数据',
    ` * 由后台 /admin 导出（${timestamp()}）`,
    ' *',
    ' * 图片放在 public/dream/works/，音频放在 public/dream/audio/。',
    ' * 改了数据后跑一次 `npm run check:dream` 自检。',
    ' */',
    "import type { DreamWork } from '@/types/dream'",
    '',
    'export const DREAM_WORKS: DreamWork[] = [',
  ]

  for (const work of works) {
    lines.push('  {')
    const fields = [
      `    id: ${quote(work.id)},`,
      `    title: ${quote(work.title)},`,
      `    category: ${quote(work.category)},`,
      stringField('tag', work.tag),
      stringField('cover', work.cover),
      stringField('coverAspect', work.coverAspect),
      stringField('media', work.media),
      stringField('description', work.description),
      stringField('body', work.body),
      stringField('tool', work.tool),
      stringField('prompt', work.prompt),
      stringField('idea', work.idea),
      stringField('creator', work.creator),
      numberField('voteCount', work.voteCount),
      booleanField('featured', work.featured),
      stringField('createdAt', work.createdAt),
      stringField('audioUrl', work.audioUrl),
      numberField('duration', work.duration),
      tagsField(work.tags),
    ].filter((line): line is string => line !== null)
    lines.push(...fields)
    lines.push('  },')
  }

  lines.push(']', '')
  return lines.join('\n')
}

/** 站点参数 → site.ts 全文 */
export function serializeSite(site: DreamSiteConfig): string {
  return [
    '/**',
    ' * AI 造梦事务所 · 站点文案参数',
    ` * 由后台 /admin 导出（${timestamp()}）`,
    ' */',
    "import type { DreamSiteConfig } from '@/types/dream'",
    '',
    'export const DREAM_SITE: DreamSiteConfig = {',
    `  title: ${quote(site.title)},`,
    `  subtitle: ${quote(site.subtitle)},`,
    `  footerOrg: ${quote(site.footerOrg)},`,
    `  footerNote: ${quote(site.footerNote)},`,
    '}',
    '',
  ].join('\n')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function downloadText(text: string, filename: string): void {
  downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), filename)
}

export interface AssetZipResult {
  blob: Blob
  /** 打进压缩包的文件 */
  files: string[]
  /** 作品引用了、但不在本机（已在仓库里）的文件 */
  missing: string[]
}

function isLocalAssetName(value: string | undefined): value is string {
  if (!value) return false
  return !value.includes('://') && !value.startsWith('/') && !value.startsWith('data:')
}

/** 把新上传的图片/音频打包成 public/dream/ 下可直接解压的 ZIP */
export async function buildAssetZip(works: readonly DreamWork[]): Promise<AssetZipResult> {
  const entries: ZipEntry[] = []
  const files: string[] = []
  const missing: string[] = []

  for (const work of works) {
    const cover = await getAsset(`${work.id}:cover`)
    if (cover) {
      const name = isLocalAssetName(work.cover) ? work.cover : `${work.id}.webp`
      entries.push({ name: `works/${name}`, data: new Uint8Array(await cover.arrayBuffer()) })
      files.push(`works/${name}`)
    } else if (isLocalAssetName(work.cover)) {
      missing.push(`public/dream/works/${work.cover}`)
    }

    const audio = await getAsset(`${work.id}:audio`)
    if (audio) {
      const name = isLocalAssetName(work.audioUrl) ? work.audioUrl : `${work.id}.mp3`
      entries.push({ name: `audio/${name}`, data: new Uint8Array(await audio.arrayBuffer()) })
      files.push(`audio/${name}`)
    }
  }

  entries.push({
    name: 'README.txt',
    data: new TextEncoder().encode(
      [
        'AI 造梦事务所 · 素材包',
        '',
        '1. 把 works/ 里的图片复制到 public/dream/works/',
        '2. 把 audio/ 里的音频复制到 public/dream/audio/',
        '3. 用后台导出的 works.ts 覆盖 src/data/dream/works.ts',
        '4. 运行 npm run check:dream 自检，再 npm run dev 预览',
        '',
        '说明：本包只包含「在后台新上传」的素材；',
        '作品如果引用的是仓库里已有的文件，不会重复打包。',
        '',
      ].join('\n'),
    ),
  })

  return { blob: createZip(entries), files, missing }
}
