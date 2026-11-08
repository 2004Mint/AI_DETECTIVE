/**
 * 页面转场遮罩
 *
 * 两个方向刻意做成不同的「语法」：
 *
 * - 进入活动（enterWithWipe）：遮罩从**被点的那张卡片**展开到整屏，
 *   跳转后从**下往上**收起（像卡片被拉成一页）；
 * - 返回游乐场（leaveToPlayground）：遮罩**从左扫入**，跳转后**向右扫出**
 *   （横向擦拭，情绪上更像「退回去」）。
 *
 * 遮罩层全局唯一（挂在 App.vue 的 #page-wipe），这里用原生 DOM 控制；
 * GSAP 走全局懒加载，减少动效 / 加载失败时直接跳转。
 */
import { loadGsap, prefersReducedMotion } from './motion'

type GsapInstance = NonNullable<Awaited<ReturnType<typeof loadGsap>>>

interface EnterOptions {
  /** 被点的卡片元素：遮罩从它的矩形展开 */
  el: HTMLElement
  to: string
  /** 该模块的主题色 */
  color: string
  /** 遮罩上显示的活动名 */
  title: string
  /** 活动英文名 */
  subtitle?: string
  push: (to: string) => Promise<unknown>
}

interface LeaveOptions {
  push: () => Promise<unknown>
}

/** 防止连点重复触发 */
let busy = false

/** 转场是否正在进行（外部用来避免吞掉导航） */
export function isPageWiping(): boolean {
  return busy
}

function overlayEl(): HTMLElement | null {
  return document.getElementById('page-wipe')
}

/** 等一个 tween 播完 */
function play(gsap: GsapInstance, target: HTMLElement, vars: Record<string, unknown>): Promise<void> {
  return new Promise<void>((resolve) => {
    gsap.to(target, { ...vars, onComplete: resolve })
  })
}

/** 写入遮罩文案与其主题色 */
function setCoverContent(
  overlay: HTMLElement,
  color: string,
  kicker: string,
  title: string,
  subtitle: string,
  iconHtml: string,
): void {
  overlay.style.setProperty('--wipe-accent', color)
  const kickerEl = overlay.querySelector<HTMLElement>('.page-wipe-kicker')
  const titleEl = overlay.querySelector<HTMLElement>('.page-wipe-title')
  const subEl = overlay.querySelector<HTMLElement>('.page-wipe-sub')
  const iconEl = overlay.querySelector<HTMLElement>('.page-wipe-icon')
  if (kickerEl) kickerEl.textContent = kicker
  if (titleEl) titleEl.textContent = title
  if (subEl) subEl.textContent = subtitle
  if (iconEl) iconEl.innerHTML = iconHtml
}

/** 跳转并留一帧给新页面挂载 */
async function navigate(push: () => Promise<unknown>, delay = 80): Promise<void> {
  try {
    await push()
  } catch {
    /* 忽略：下面照样把遮罩收掉 */
  }
  await new Promise((resolve) => window.setTimeout(resolve, delay))
}

/* ---------------- 进入：从卡片展开，向上收起 ---------------- */

export async function enterWithWipe(options: EnterOptions): Promise<void> {
  if (busy) return

  const overlay = overlayEl()
  if (!overlay || prefersReducedMotion()) {
    await options.push(options.to)
    return
  }

  const gsap = await loadGsap()
  if (!gsap) {
    await options.push(options.to)
    return
  }

  busy = true
  overlay.classList.add('is-active')

  /* 图标直接复用卡片里那个 SVG */
  const sourceIcon = options.el.querySelector<HTMLElement>('.module-icon')
  setCoverContent(
    overlay,
    options.color,
    'ENTERING',
    options.title,
    options.subtitle ?? '',
    sourceIcon ? sourceIcon.innerHTML : '',
  )

  /* 起始状态：遮罩正好等于卡片的位置与圆角 */
  const rect = options.el.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const top = Math.max(0, rect.top)
  const left = Math.max(0, rect.left)
  const right = Math.max(0, vw - rect.right)
  const bottom = Math.max(0, vh - rect.bottom)

  const contentEl = overlay.querySelector<HTMLElement>('.page-wipe-content')
  gsap.set(overlay, {
    opacity: 1,
    clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 22px)`,
  })
  if (contentEl) gsap.set(contentEl, { opacity: 0, y: 14, scale: 0.96 })

  /* 1. 从卡片铺满整屏 */
  await play(gsap, overlay, {
    clipPath: 'inset(0px 0px 0px 0px round 0px)',
    duration: 0.42,
    ease: 'power4.inOut',
  })
  if (contentEl) gsap.to(contentEl, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'power2.out' })

  /* 2. 铺满时跳转 */
  await navigate(() => options.push(options.to), 80)

  /* 3. 从下往上收起，露出新页面 */
  await play(gsap, overlay, {
    clipPath: 'inset(0% 0% 100% 0% round 0px)',
    duration: 0.42,
    ease: 'power3.inOut',
  })
  if (contentEl) gsap.set(contentEl, { opacity: 0 })

  overlay.classList.remove('is-active')
  gsap.set(overlay, { opacity: 0 })
  busy = false
}

/* ---------------- 返回：左进 → 右出 ---------------- */

const HIDDEN_LEFT = 'inset(0% 100% 0% 0%)'
const COVERED = 'inset(0% 0% 0% 0%)'
const OFF_RIGHT = 'inset(0% 0% 0% 100%)'

export async function leaveToPlayground(options: LeaveOptions): Promise<void> {
  if (busy) return

  const overlay = overlayEl()
  if (!overlay || prefersReducedMotion()) {
    await options.push()
    return
  }

  const gsap = await loadGsap()
  if (!gsap) {
    await options.push()
    return
  }

  busy = true
  overlay.classList.add('is-active')

  setCoverContent(
    overlay,
    '#ff8a1c',
    'BACK TO PARK',
    '返回游乐场',
    'AI INSPIRATION PARK',
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="30" height="30"><path d="M15 18l-6-6 6-6" /></svg>',
  )

  const contentEl = overlay.querySelector<HTMLElement>('.page-wipe-content')
  gsap.set(overlay, { opacity: 1, clipPath: HIDDEN_LEFT })
  if (contentEl) gsap.set(contentEl, { opacity: 0, x: -10 })

  /* 1. 从左扫入 */
  await play(gsap, overlay, { clipPath: COVERED, duration: 0.4, ease: 'power4.inOut' })
  if (contentEl) gsap.to(contentEl, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' })

  /* 2. 铺满时跳转 */
  await navigate(() => options.push(), 70)

  /* 3. 从右扫出 */
  await play(gsap, overlay, { clipPath: OFF_RIGHT, duration: 0.42, ease: 'power4.inOut' })
  if (contentEl) gsap.set(contentEl, { opacity: 0 })

  overlay.classList.remove('is-active')
  gsap.set(overlay, { opacity: 0 })
  busy = false
}
