#!/usr/bin/env node
/**
 * 图片瘦身：把题目素材与表情帧统一转成 WebP
 *
 * 背景：素材原图多为 PNG 存照片（单张最大 3 MB），10 题一轮要在手机上加载 20 张，
 * 弱网下每轮都要等好几秒。本脚本把它们转成 WebP 并限制最大宽度，
 * 整包体积通常能压到原来的 1/5 左右。
 *
 * 用法：
 *   node scripts/optimize-images.mjs            # 试运行：只报告体积与尺寸，不动文件
 *   node scripts/optimize-images.mjs --write    # 实际转换，成功后删除原图
 *
 * 可选参数：
 *   --quality=82      WebP 质量（默认按目标分组取值）
 *   --max-width=1280  最大宽度（仅缩小，不放大小图）
 *   --keep-originals  转换后保留原图（默认删除，避免同名不同扩展名撞图）
 *
 * ⚠️ 公平性：AI 图与真实照片必须用**完全相同**的参数处理。
 *    否则压缩痕迹本身会变成「哪张是 AI」的线索，破坏游戏性。
 *    因此下面 TARGETS 里 ai / real 两组的 quality 与 maxWidth 刻意保持一致。
 */
import { readdir, readFile, rm, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const argv = process.argv.slice(2)
const WRITE = argv.includes('--write')
const KEEP_ORIGINALS = argv.includes('--keep-originals')

/** 读取 --key=value 形式的参数 */
function numArg(key, fallback) {
  const hit = argv.find((a) => a.startsWith(`--${key}=`))
  if (!hit) return fallback
  const value = Number(hit.split('=')[1])
  return Number.isFinite(value) ? value : fallback
}

const CLI_QUALITY = numArg('quality', null)
const CLI_MAX_WIDTH = numArg('max-width', null)

/**
 * 待处理分组。
 * 表情帧是透明贴纸，必须保留 alpha 通道，因此质量给高一些、尺寸也放宽。
 */
const TARGETS = [
  {
    dir: 'src/assets/images/ai',
    match: /\.(png|jpe?g)$/i,
    label: 'AI 生成图',
    maxWidth: 1280,
    quality: 82,
  },
  {
    dir: 'src/assets/images/real',
    match: /\.(png|jpe?g)$/i,
    label: '真实照片',
    maxWidth: 1280,
    quality: 82,
  },
  {
    dir: 'src/assets/images/pet/frames',
    match: /^frame-.*\.(png|jpe?g)$/i,
    label: '表情帧（带透明）',
    maxWidth: 640,
    quality: 90,
  },
]

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
const pct = (before, after) => `${Math.round((1 - after / before) * 100)}%`
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 删除原图。
 * Windows 上杀软 / 索引器可能短暂占用刚读过的文件，因此退避重试几次。
 */
async function unlinkWithRetry(target, attempts = 6) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await unlink(target)
      return
    } catch (error) {
      if (error.code === 'ENOENT') return
      if (i === attempts || error.code !== 'EBUSY') throw error
      await sleep(120 * i)
    }
  }
}

/** 处理单个文件；返回体积统计 */
async function convertOne(filePath, target) {
  const before = (await stat(filePath)).size
  const maxWidth = CLI_MAX_WIDTH ?? target.maxWidth
  const quality = CLI_QUALITY ?? target.quality

  // 先把源图读进内存再交给 sharp：否则 sharp 会持有文件句柄，Windows 上删原图会 EBUSY
  const input = await readFile(filePath)
  let pipeline = sharp(input, { failOn: 'none' })
  const meta = await pipeline.metadata()
  // 只缩小、不放大小图
  const needsResize = Boolean(meta.width && meta.width > maxWidth)
  if (needsResize) {
    pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
  }

  const outPath = filePath.replace(/\.[^.]+$/, '.webp')
  const buffer = await pipeline.webp({ quality, effort: 5 }).toBuffer()

  const dims =
    needsResize && meta.width
      ? `${meta.width}x${meta.height} → ${maxWidth}x${Math.round((meta.height * maxWidth) / meta.width)}`
      : `${meta.width}x${meta.height}（保持）`

  // 体积没变小就不替换：删掉刚生成的 webp、保留原图，避免负优化
  const worse = buffer.length >= before
  let after = buffer.length
  let skipped = false

  if (worse) {
    skipped = true
    after = before
    if (WRITE) await rm(outPath, { force: true })
  } else if (WRITE) {
    await writeFile(outPath, buffer)
    if (!KEEP_ORIGINALS && outPath !== filePath) await unlinkWithRetry(filePath)
  }

  return {
    file: path.relative(ROOT, filePath).replace(/\\/g, '/'),
    before,
    after,
    dims,
    skipped,
  }
}

/** 处理一个分组 */
async function convertGroup(target) {
  const dir = path.join(ROOT, target.dir)
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    console.log(`\n【${target.label}】目录不存在，跳过：${target.dir}`)
    return { rows: [], before: 0, after: 0 }
  }

  const files = entries
    .filter((e) => e.isFile() && target.match.test(e.name) && !e.name.endsWith('.webp'))
    .map((e) => path.join(dir, e.name))
    .sort()

  console.log(`\n【${target.label}】${files.length} 张 · 最大宽度 ${CLI_MAX_WIDTH ?? target.maxWidth}px · 质量 ${CLI_QUALITY ?? target.quality}`)

  const rows = []
  let before = 0
  let after = 0
  for (const file of files) {
    const row = await convertOne(file, target)
    rows.push(row)
    before += row.before
    after += row.after
    const flag = row.skipped ? '（未变小，跳过）' : ''
    console.log(
      `  ${row.file.padEnd(46)} ${kb(row.before).padStart(8)} → ${kb(row.after).padStart(8)}  -${pct(row.before, row.after).padStart(4)}  ${row.dims} ${flag}`,
    )
  }

  console.log(`  小计：${files.length} 张  ${mb(before)} → ${mb(after)}  省 ${pct(before, after)}`)
  return { rows, before, after }
}

/**
 * 转换后自检：同一素材不能同时存在两种扩展名。
 * questions.ts 遇到 animal_1.png + animal_1.webp 会判为重名并忽略后者，出题就少一张图。
 */
async function checkDuplicates() {
  const problems = []
  for (const target of TARGETS) {
    const dir = path.join(ROOT, target.dir)
    const files = await readdir(dir).catch(() => [])
    const byStem = new Map()
    for (const name of files) {
      const stem = name.replace(/\.[^.]+$/, '')
      byStem.set(stem, [...(byStem.get(stem) ?? []), name])
    }
    for (const [stem, names] of byStem) {
      if (names.length > 1) problems.push(`${target.dir}/${stem} → ${names.join(' + ')}`)
    }
  }

  if (problems.length > 0) {
    console.log('\n⚠️ 同一素材存在多个文件（出题会撞图，请只保留一个）：')
    problems.forEach((p) => console.log(`  ${p}`))
    process.exitCode = 1
  } else {
    console.log('\n✓ 自检通过：每个素材只有一份文件，无重名。')
  }
}

async function main() {
  console.log(WRITE ? '=== 图片瘦身（实际写入）===' : '=== 图片瘦身（试运行，不会改动文件；加 --write 才真正转换）===')
  const results = []
  for (const target of TARGETS) results.push(await convertGroup(target))

  const before = results.reduce((s, r) => s + r.before, 0)
  const after = results.reduce((s, r) => s + r.after, 0)
  const count = results.reduce((s, r) => s + r.rows.length, 0)

  console.log('\n=== 合计 ===')
  console.log(`  ${count} 张：${mb(before)} → ${mb(after)}  共省 ${mb(before - after)}（${pct(before, after)}）`)
  if (!WRITE) {
    console.log('\n试运行结束。确认无误后执行：npm run optimize:images')
  } else {
    console.log('\n完成。原图已删除（git 历史中仍可找回），代码里的 import.meta.glob 会自动改用 .webp。')
    console.log('注意：src/components/MascotPet.vue 的表情帧 glob 写死了 frame-*.png，转格式后需同步改为 frame-*。')
    await checkDuplicates()
  }
}

main().catch((error) => {
  console.error('转换失败：', error)
  process.exitCode = 1
})
