/**
 * AI 人格研究所 · 结果图导出
 *
 * 用 canvas 直接画一张 900×1320 的「人格档案」图，不依赖任何截图库。
 * 场景：现场同学想发朋友圈 / 群里，直接点「保存图片」即可。
 *
 * 注意：
 * - 字体走系统字体栈，不额外加载 webfont（现场网差时也不糊）；
 * - 画布尺寸固定，长文案用自动换行 + 截断保护，不会画出界。
 */
import type { PersonalityResult } from '@/types/personality'

const W = 900
const H = 1360
const PAD = 72
const FONT = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif'

/** letterSpacing 是较新的 canvas 属性，用可选写法兼容老浏览器 */
type SpacedContext = CanvasRenderingContext2D & { letterSpacing?: string }
function setSpacing(ctx: CanvasRenderingContext2D, value: string): void {
  ;(ctx as SpacedContext).letterSpacing = value
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

/** 按最大宽度折行，返回行数组 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const char of [...text]) {
    if (char === '\n') {
      lines.push(line)
      line = ''
      continue
    }
    const next = line + char
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = char
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

/** 画一段自动换行的正文，返回占用高度 */
function drawParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  color: string,
  font: string,
  maxLines = 20,
): number {
  ctx.font = font
  ctx.fillStyle = color
  const lines = wrapText(ctx, text, maxWidth).slice(0, maxLines)
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight))
  return lines.length * lineHeight
}

function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** 画结果图并触发下载；iOS Safari 不支持 download 时会退化为打开图片长按保存 */
export async function downloadPersonalityCard(result: PersonalityResult, sampleNo: string): Promise<void> {
  const p = result.personality
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('当前浏览器不支持 canvas')

  /* 背景：与站点同款暖可可夜底 */
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#33200f')
  bg.addColorStop(0.55, '#25150c')
  bg.addColorStop(1, '#1b0e07')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  /* 人格主题色光晕 */
  const glow = ctx.createRadialGradient(W * 0.5, -80, 40, W * 0.5, -80, 620)
  glow.addColorStop(0, withAlpha(p.accent, 0.42))
  glow.addColorStop(1, withAlpha(p.accent, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, 700)

  const maxWidth = W - PAD * 2
  let y = 96

  /* 抬头 */
  ctx.fillStyle = 'rgba(148, 163, 184, 0.85)'
  ctx.font = `700 22px ${FONT}`
  setSpacing(ctx, '6px')
  ctx.fillText('AI 人格研究所', PAD, y)
  setSpacing(ctx, '0px')
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(100, 116, 139, 0.9)'
  ctx.font = `500 22px ${FONT}`
  ctx.fillText(`NO.${sampleNo}`, W - PAD, y)
  ctx.textAlign = 'left'

  y += 34
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)'
  ctx.setLineDash([6, 8])
  ctx.beginPath()
  ctx.moveTo(PAD, y)
  ctx.lineTo(W - PAD, y)
  ctx.stroke()
  ctx.setLineDash([])

  /* 编号 + 英文代号 */
  y += 62
  ctx.fillStyle = p.accent
  ctx.font = `800 30px ${FONT}`
  setSpacing(ctx, '4px')
  ctx.fillText(p.code, PAD, y)
  const codeWidth = ctx.measureText(p.code).width
  setSpacing(ctx, '0px')
  ctx.fillStyle = 'rgba(148, 163, 184, 0.9)'
  ctx.font = `700 24px ${FONT}`
  ctx.fillText(p.en, PAD + codeWidth + 26, y)

  /* 人格名称 */
  y += 74
  ctx.fillStyle = '#ffffff'
  ctx.font = `900 58px ${FONT}`
  const nameLines = wrapText(ctx, p.name, maxWidth).slice(0, 2)
  nameLines.forEach((line, index) => ctx.fillText(line, PAD, y + index * 70))
  y += (nameLines.length - 1) * 70

  /* 名称下方的一道主题色短线，和页面上的卡片呼应 */
  y += 26
  ctx.fillStyle = p.accent
  roundRect(ctx, PAD, y, 56, 4, 2)
  ctx.fill()

  /* 宣言 */
  y += 44
  ctx.fillStyle = 'rgba(226, 232, 240, 0.92)'
  ctx.font = `500 28px ${FONT}`
  const declLines = wrapText(ctx, p.declaration, maxWidth).slice(0, 2)
  declLines.forEach((line, index) => ctx.fillText(line, PAD, y + index * 44))
  y += (declLines.length - 1) * 44

  /* 关键词 */
  y += 42
  let chipX = PAD
  ctx.font = `600 24px ${FONT}`
  for (const word of p.keywords) {
    const textWidth = ctx.measureText(word).width
    const chipW = textWidth + 44
    if (chipX + chipW > W - PAD) break
    ctx.fillStyle = withAlpha(p.accent, 0.16)
    roundRect(ctx, chipX, y - 26, chipW, 44, 22)
    ctx.fill()
    ctx.strokeStyle = withAlpha(p.accent, 0.4)
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.fillStyle = p.accent
    ctx.fillText(word, chipX + 22, y + 4)
    chipX += chipW + 12
  }

  /* 描述 */
  y += 78
  const descHeight = drawParagraph(
    ctx,
    p.description,
    PAD,
    y,
    maxWidth,
    46,
    'rgba(203, 213, 225, 0.95)',
    `400 26px ${FONT}`,
    6,
  )
  y += descHeight

  /* 行为特点 */
  y += 46
  ctx.fillStyle = 'rgba(120, 132, 148, 0.95)'
  ctx.font = `700 20px ${FONT}`
  setSpacing(ctx, '5px')
  ctx.fillText('BEHAVIOUR', PAD, y)
  setSpacing(ctx, '0px')
  y += 38
  for (const trait of p.traits) {
    ctx.fillStyle = p.accent
    ctx.beginPath()
    ctx.arc(PAD + 6, y - 8, 5, 0, Math.PI * 2)
    ctx.fill()
    const height = drawParagraph(
      ctx,
      trait,
      PAD + 28,
      y,
      maxWidth - 28,
      38,
      'rgba(203, 213, 225, 0.95)',
      `400 24px ${FONT}`,
      2,
    )
    y += Math.max(height, 38)
  }

  /* 台词：先量高度再画底框，最后写字，避免文字被底色压住 */
  y += 30
  ctx.font = `500 25px ${FONT}`
  const quoteLines = wrapText(ctx, p.quote, maxWidth - 56).slice(0, 3)
  const quoteHeight = quoteLines.length * 38
  ctx.fillStyle = withAlpha(p.accent, 0.12)
  roundRect(ctx, PAD, y, maxWidth, quoteHeight + 52, 20)
  ctx.fill()
  ctx.fillStyle = p.accent
  ctx.fillRect(PAD, y + 16, 3, quoteHeight + 20)
  /* 顶边的一小段强调线 */
  roundRect(ctx, PAD + 28, y, 30, 3, 1.5)
  ctx.fill()
  quoteLines.forEach((line, index) => ctx.fillText(line, PAD + 28, y + 34 + index * 38))

  /* 页脚 */
  ctx.fillStyle = 'rgba(120, 132, 148, 0.9)'
  ctx.font = `400 20px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('重庆外语外事学院 · 人工智能学生研讨与实践社', W / 2, H - 74)
  ctx.fillStyle = 'rgba(90, 100, 114, 0.85)'
  ctx.font = `400 18px ${FONT}`
  ctx.fillText('AI 人格研究所 · 结果仅供娱乐，不作为心理测评依据', W / 2, H - 40)
  ctx.textAlign = 'left'

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('结果图生成失败')

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `AI人格-${p.code}-${p.name}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 5000)
}
