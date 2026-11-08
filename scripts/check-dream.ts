/**
 * AI 造梦事务所 · 作品数据自检
 *
 * 加作品 / 换图之后跑一次：
 *   npm run check:dream
 *
 * 检查：
 * 1. 必填字段（id / title / category）、id 唯一性、id 命名；
 * 2. cover / audioUrl 指向的文件是否真的存在（完整 URL 不校验）；
 * 3. 音乐作品有没有音频；
 * 4. 素材目录里有哪些文件「放了但没被作品引用」；
 * 5. 各分类作品数量。
 *
 * 直接 import 页面所用的同一份 `src/data/dream/works.ts`，不是另写一份数据。
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DREAM_WORKS } from '../src/data/dream/works.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC_DREAM = join(ROOT, 'public', 'dream')
const WORKS_DIR = join(PUBLIC_DREAM, 'works')
const AUDIO_DIR = join(PUBLIC_DREAM, 'audio')

const CATEGORY_KEYS = ['visual', 'text', 'music', 'idea'] as const
const CATEGORY_LABELS: Record<(typeof CATEGORY_KEYS)[number], string> = {
  visual: 'AI 视觉',
  text: 'AI 文字',
  music: 'AI 音乐',
  idea: 'AI 脑洞',
}

let errors = 0
let warnings = 0

function fail(message: string): void {
  errors += 1
  console.error(`  ✗ ${message}`)
}

function warn(message: string): void {
  warnings += 1
  console.warn(`  ! ${message}`)
}

/** 递归列出目录下的相对路径（跳过隐藏文件） */
function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return []
  const files: string[] = []
  const walk = (current: string, prefix: string): void => {
    for (const entry of readdirSync(current)) {
      if (entry.startsWith('.')) continue
      const full = join(current, entry)
      if (statSync(full).isDirectory()) walk(full, `${prefix}${entry}/`)
      else files.push(`${prefix}${entry}`)
    }
  }
  walk(dir, '')
  return files
}

function isExternal(value: string): boolean {
  return (
    /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(value) ||
    value.startsWith('/') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  )
}

/** 把作品里写的地址换算成素材目录下的相对路径 */
function toRelative(value: string, kind: 'works' | 'audio'): string {
  const clean = value.trim().replace(/^\.\//, '')
  if (clean.includes('/')) return clean.replace(new RegExp(`^${kind}/`), '')
  return clean
}

function checkFile(value: string | undefined, kind: 'works' | 'audio', label: string): string | null {
  if (!value) return null
  if (isExternal(value)) return null // 完整 URL / data URL 不校验本地文件
  const relative = toRelative(value, kind)
  const base = kind === 'works' ? WORKS_DIR : AUDIO_DIR
  if (!existsSync(join(base, relative))) {
    const kindText = kind === 'works' ? '图片' : '音频'
    fail(`${label} 引用的${kindText}不存在：public/dream/${kind}/${relative}`)
  }
  return relative
}

console.log('\nAI 造梦事务所 · 作品自检')
console.log('数据文件：src/data/dream/works.ts')
console.log(`作品数量：${DREAM_WORKS.length} 件\n`)

if (DREAM_WORKS.length === 0) {
  console.log('  · 目前还没有作品。')
  console.log('  · 打开 src/data/dream/works.ts，按文件里的模板加一条即可；')
  console.log('  · 图片放 public/dream/works/，音频放 public/dream/audio/。\n')
  process.exit(0)
}

const ids = new Set<string>()
const usedCovers = new Set<string>()
const usedAudio = new Set<string>()
const counts = { visual: 0, text: 0, music: 0, idea: 0 }

DREAM_WORKS.forEach((work, index) => {
  const label = `#${index + 1}「${work.title || '(无标题)'}」`

  if (!work.id) {
    fail(`${label} 缺少 id`)
  } else if (ids.has(work.id)) {
    fail(`${label} id 重复：${work.id}`)
  } else {
    ids.add(work.id)
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(work.id)) {
      warn(`${label} id 建议只用小写英文 + 短横线，例如 visual-01（当前：${work.id}）`)
    }
  }

  if (!work.title) fail(`${label} 缺少 title`)

  if (!CATEGORY_KEYS.includes(work.category)) {
    fail(`${label} category 非法：${String(work.category)}（应为 ${CATEGORY_KEYS.join(' / ')}）`)
  } else {
    counts[work.category] += 1
  }

  if (work.cover) {
    const relative = checkFile(work.cover, 'works', label)
    if (relative) usedCovers.add(relative)
  } else {
    warn(`${label} 没有 cover，画廊会显示「待补充作品图片」`)
  }

  if (work.category === 'music' && !work.audioUrl) {
    warn(`${label} 是音乐作品，但没有 audioUrl（详情页会显示「音频正在上传中」）`)
  }
  if (work.audioUrl) {
    const relative = checkFile(work.audioUrl, 'audio', label)
    if (relative) usedAudio.add(relative)
  }

  if (!work.description) warn(`${label} 没有 description`)
  if (work.category !== 'music' && !work.prompt) warn(`${label} 没有 prompt`)
})

for (const file of listFiles(WORKS_DIR)) {
  if (!usedCovers.has(file)) warn(`图片没有被任何作品引用：public/dream/works/${file}`)
}
for (const file of listFiles(AUDIO_DIR)) {
  if (!usedAudio.has(file)) warn(`音频没有被任何作品引用：public/dream/audio/${file}`)
}

console.log('')
console.log(
  `分类统计：${CATEGORY_KEYS.map((key) => `${CATEGORY_LABELS[key]} ${counts[key]} 件`).join(' / ')}`,
)
console.log('')

if (errors === 0) {
  console.log(`✅ 作品数据通过（${DREAM_WORKS.length} 件，${warnings} 条提醒）`)
  process.exit(0)
}

console.error(`❌ 发现 ${errors} 个问题、${warnings} 条提醒，请按上面的 ✗ 修改`)
process.exit(1)
