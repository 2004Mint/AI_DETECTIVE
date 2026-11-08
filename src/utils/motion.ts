/**
 * 全站动效基础设施
 *
 * GSAP 体积不小，所以全局只加载一次、按需动态引入；
 * 「减少动态效果」的判定也集中在这里，避免每个组件各写一遍。
 */
import type { gsap as GsapType } from 'gsap'

type Gsap = typeof GsapType

let gsapPromise: Promise<Gsap | null> | null = null

/** 懒加载 GSAP；失败时返回 null，调用方自动降级为静态呈现 */
export function loadGsap(): Promise<Gsap | null> {
  if (!gsapPromise) {
    gsapPromise = import('gsap')
      .then((module) => module.gsap)
      .catch(() => null)
  }
  return gsapPromise
}

/** 应用启动即预取，用户翻到下一页时脚本已在缓存里 */
if (typeof window !== 'undefined') void loadGsap()

/** 系统是否开启「减少动态效果」 */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 元素是否在首屏附近（视口外的只淡入、不做位移） */
export function nearViewport(el: HTMLElement, margin = 120): boolean {
  return el.getBoundingClientRect().top < window.innerHeight + margin
}
