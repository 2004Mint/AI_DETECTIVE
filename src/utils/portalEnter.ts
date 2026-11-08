/**
 * 入口页三个板块卡片的专属入场动画
 *
 * 三张卡不再是同一个「淡入上浮」，而是各自对应活动的内容气质：
 *
 * 1. scan   鉴定师  —— 从左侧滑入，一道橙色扫描光横扫卡面，图标像「锁定目标」一样聚焦；
 * 2. float  造梦    —— 轻轻浮起并放大，斜向高光扫过，三粒星尘上浮（作品展的轻盈感）；
 * 3. unfold 人格    —— 像档案卡被拉开一样从下往上展开（clip-path），顶部主题色细线同时画出。
 *
 * 实现要点：
 * - 先把三张卡同步设为初始态再排队，避免「先亮一下再消失」的闪动；
 * - GSAP 最多等 350ms，加载失败就直接显示，绝不留白；
 * - 系统开启「减少动态效果」时什么都不做。
 */
import { loadGsap, prefersReducedMotion } from './motion'

export interface PortalIntroCleanup {
  (): void
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => window.setTimeout(() => resolve(null), ms))])
}

/** 依次播放三张卡的入场；返回取消函数（页面卸载时调用） */
export async function playPortalIntro(cards: HTMLElement[]): Promise<PortalIntroCleanup> {
  const list = cards.filter((el) => el.isConnected)
  if (!list.length || prefersReducedMotion()) return () => {}

  /* 先同步隐藏：等待 GSAP 的这段时间里不能先亮一下 */
  list.forEach((el) => {
    el.style.opacity = '0'
  })

  const gsap = await withTimeout(loadGsap(), 350)
  if (!gsap) {
    list.forEach((el) => {
      el.style.opacity = ''
    })
    return () => {}
  }

  const ctx = gsap.context(() => {
    list.forEach((el, index) => {
      const preset = el.dataset.enter ?? 'float'
      const width = el.offsetWidth || 320
      const icon = el.querySelector<HTMLElement>('.module-icon')
      const tl = gsap.timeline({ delay: 0.1 + index * 0.13 })

      /* 初始态统一在这里设置（而不是写在 fromTo 里），保证延迟期间也是「关着」的 */
      if (preset === 'scan') {
        gsap.set(el, { opacity: 0, x: -22 })
      } else if (preset === 'unfold') {
        gsap.set(el, { opacity: 0, x: 18, clipPath: 'inset(0% 0% 100% 0%)' })
      } else {
        gsap.set(el, { opacity: 0, y: 26, scale: 0.93 })
      }

      if (preset === 'scan') {
        /* 鉴定师：横向扫入 + 扫描线 */
        tl.to(el, { opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' }, 0)

        const line = el.querySelector<HTMLElement>('.module-scan')
        if (line) {
          gsap.set(line, { x: -8, opacity: 0 })
          tl.to(line, { opacity: 1, duration: 0.1 }, 0.06)
            .to(line, { x: width + 8, duration: 0.72, ease: 'power1.inOut' }, 0.1)
            .to(line, { opacity: 0, duration: 0.22 }, 0.72)
        }
        if (icon) {
          gsap.set(icon, { scale: 0.72, rotate: -8 })
          tl.to(icon, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.2)' }, 0.14)
        }
      } else if (preset === 'unfold') {
        /* 人格：像档案卡被拉开 */
        tl.to(el, { opacity: 1, x: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.62, ease: 'power3.out' }, 0)
        if (icon) {
          gsap.set(icon, { scale: 0.6, opacity: 0 })
          tl.to(icon, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.6)' }, 0.2)
        }
        const rule = el.querySelector<HTMLElement>('.module-rule')
        if (rule) {
          gsap.set(rule, { scaleX: 0, opacity: 1 })
          tl.to(rule, { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 0.26).to(
            rule,
            { opacity: 0, duration: 0.35, ease: 'power1.out' },
            0.72,
          )
        }
      } else {
        /* 造梦：浮起 + 高光 + 星尘 */
        tl.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'expo.out' }, 0)
        if (icon) {
          gsap.set(icon, { rotate: -14, scale: 0.8 })
          tl.to(icon, { rotate: 0, scale: 1, duration: 0.7, ease: 'back.out(1.8)' }, 0.02)
        }

        const shimmer = el.querySelector<HTMLElement>('.module-shimmer')
        if (shimmer) {
          gsap.set(shimmer, { opacity: 0, x: -width * 0.4 })
          tl.to(shimmer, { opacity: 1, duration: 0.12 }, 0.16)
            .to(shimmer, { x: width * 1.2, duration: 0.8, ease: 'power2.inOut' }, 0.18)
            .to(shimmer, { opacity: 0, duration: 0.2 }, 0.74)
        }

        el.querySelectorAll<HTMLElement>('.module-spark').forEach((spark, sparkIndex) => {
          const start = 0.22 + sparkIndex * 0.08
          gsap.set(spark, { opacity: 0, y: 16, scale: 0.6 })
          tl.to(spark, { opacity: 0.9, y: -24, scale: 1, duration: 0.85, ease: 'sine.out' }, start).to(
            spark,
            { opacity: 0, duration: 0.3 },
            start + 0.6,
          )
        })
      }

      /* 结束后清掉内联样式，交还给 Tailwind 的 hover / active */
      tl.set(el, { clearProps: 'opacity,transform,clipPath' })
    })
  })

  return () => ctx.revert()
}
