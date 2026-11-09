/**
 * AI 灵感游乐场 · 活动海报合成脚本
 *
 * 分工：
 * - 背景、标题、卡纸、三个板块胶囊、页脚文字 —— 本地 Qwen-Image 2.1 生成（assets/bg-ai.png）；
 * - 二维码、研小鸿 —— AI 画不准，这里用真实素材合成。
 *
 * 用法：node poster/make-poster.mjs
 * 产物（poster/out/，已被 .gitignore 忽略）：
 *   poster-web.png        1080×1536  发群 / 公众号 / 屏幕
 *   poster-A4-300dpi.png  2480×3508  A4 打印（300 dpi）
 *
 * 换背景：覆盖 assets/bg-ai.png 后重跑。脚本会自己量出米白卡纸的位置，
 * 再按比例放二维码和研小鸿，所以换一版 AI 图不用改坐标。
 * 只想看量出来的卡纸坐标：node poster/make-poster.mjs --measure
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const HERE = dirname(fileURLToPath(import.meta.url))
const ASSETS = resolve(HERE, 'assets')
const OUT = resolve(HERE, 'out')

const BG = resolve(ASSETS, 'bg-ai.png')
const QR = resolve(ASSETS, 'qr-site.png')
const MASCOT = resolve(HERE, '..', 'src', 'assets', 'images', 'pet', 'frames', 'frame-01.webp')

/** 二维码底板占卡纸宽度的比例，以及底板内四周的静区比例（扫描器靠它找码） */
const PLATE_RATIO = 0.66
const QUIET_RATIO = 0.115
/** 研小鸿相对卡纸的比例与偏移，让它趴在卡纸左上角 */
const MASCOT_RATIO = 0.27
const MASCOT_OFFSET = { x: -0.38, y: -0.34, angle: -7 }

/** 量出米白卡纸的边界（AI 图里唯一一块大面积浅色区域） */
async function measureCard(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const w = info.width
  const h = info.height
  const isCream = (i) => data[i] > 240 && data[i + 1] > 232 && data[i + 2] > 200

  const rows = []
  for (let y = 0; y < h; y++) {
    let count = 0
    for (let x = 0; x < w; x++) if (isCream((y * w + x) * 3)) count++
    if (count > w * 0.5) rows.push(y)
  }
  if (rows.length === 0) throw new Error('没找到米白卡纸：背景图可能不是这个版式')

  const midY = Math.round((rows[0] + rows[rows.length - 1]) / 2)
  let left = -1
  let right = -1
  for (let x = 0; x < w; x++) {
    if (isCream((midY * w + x) * 3)) {
      if (left < 0) left = x
      right = x
    }
  }
  return { left, top: rows[0], right, bottom: rows[rows.length - 1], width: w, height: h }
}

async function render({ card, width, height, out }) {
  const sx = width / card.width
  const sy = height / card.height
  const px = (v) => Math.round(v * sx)
  const py = (v) => Math.round(v * sy)

  const cardW = card.right - card.left
  const plateSize = Math.round(cardW * PLATE_RATIO)
  const quiet = Math.round(plateSize * QUIET_RATIO)
  const qrSize = plateSize - quiet * 2
  const plateLeft = Math.round((card.left + card.right) / 2 - plateSize / 2)
  const plateTop = Math.round((card.top + card.bottom) / 2 - plateSize / 2)

  const mascotSize = Math.round(cardW * MASCOT_RATIO)
  const mascotLeft = Math.round(card.left + mascotSize * MASCOT_OFFSET.x)
  const mascotTop = Math.round(card.top + mascotSize * MASCOT_OFFSET.y)

  const base = await sharp(BG).resize(width, height, { kernel: 'lanczos3' }).png().toBuffer()

  // 1. 吉祥物背后的暖橙光晕
  const glowSize = Math.round(mascotSize * 1.55 * sx)
  const glowSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${glowSize}" height="${glowSize}">
    <defs><radialGradient id="g">
      <stop offset="0" stop-color="#ff8a1c" stop-opacity="0.5"/>
      <stop offset="0.55" stop-color="#ff8a1c" stop-opacity="0.15"/>
      <stop offset="1" stop-color="#ff8a1c" stop-opacity="0"/>
    </radialGradient></defs>
    <circle cx="${glowSize / 2}" cy="${glowSize / 2}" r="${glowSize / 2}" fill="url(#g)"/></svg>`
  const glow = await sharp(Buffer.from(glowSvg)).png().toBuffer()

  // 2. 研小鸿（素材自带透明通道，缩放 + 微转）
  const mascot = await sharp(MASCOT)
    .resize(px(mascotSize), py(mascotSize), { kernel: 'lanczos3' })
    .rotate(MASCOT_OFFSET.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  // 3. 二维码白底板（比卡纸白一档，看起来像贴上去的一张码）
  const plateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px(plateSize)}" height="${py(plateSize)}">
    <rect x="0" y="0" width="${px(plateSize)}" height="${py(plateSize)}" rx="${px(34)}" fill="#ffffff"/></svg>`
  const plate = await sharp(Buffer.from(plateSvg)).png().toBuffer()

  // 4. 二维码（最近邻放大，保持边界锐利）
  const qr = await sharp(QR).resize(px(qrSize), py(qrSize), { kernel: 'nearest' }).png().toBuffer()

  const info = await sharp(base)
    .composite([
      {
        input: glow,
        left: px(mascotLeft - mascotSize * 0.27),
        top: py(mascotTop - mascotSize * 0.27),
      },
      { input: mascot, left: px(mascotLeft), top: py(mascotTop) },
      { input: plate, left: px(plateLeft), top: py(plateTop) },
      { input: qr, left: px(plateLeft + quiet), top: py(plateTop + quiet) },
    ])
    .png({ compressionLevel: 9 })
    .toFile(out)

  console.log(`${out}  ${info.width}×${info.height}  ${Math.round(info.size / 1024)} KB`)
}

const card = await measureCard(BG)
console.log(`卡纸：${JSON.stringify(card)}`)

if (!process.argv.includes('--measure')) {
  mkdirSync(OUT, { recursive: true })
  await render({ card, width: 1080, height: 1536, out: resolve(OUT, 'poster-web.png') })
  await render({ card, width: 2480, height: 3508, out: resolve(OUT, 'poster-A4-300dpi.png') })
  // 群里转发用的小图（微信会再压一次，这里先压好，别直接传 6 MB 的原图）
  const jpg = await sharp(resolve(OUT, 'poster-web.png'))
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(resolve(OUT, 'poster-share.jpg'))
  console.log(`${resolve(OUT, 'poster-share.jpg')}  ${jpg.width}×${jpg.height}  ${Math.round(jpg.size / 1024)} KB`)
  writeFileSync(resolve(OUT, '.gitkeep'), '')
}
