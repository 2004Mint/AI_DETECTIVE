/**
 * 全站入场动效 · v-reveal 指令
 *
 * 用法：
 *   <section v-reveal>…</section>
 *   <h1 v-reveal="60">…</h1>
 *   <li v-for="(item, i) in list" :key="item.id" v-reveal="120 + i * 70">…</li>
 *   <h2 v-reveal="{ delay: 80, y: 20 }">…</h2>
 *
 * 设计约束（与结果页保持同一套手感）：
 * 1. 只在进入时播一次，不循环、不随交互抖动；
 * 2. 位移 16px、时长 0.5s、缓动 power2.out；
 * 3. GSAP 懒加载 + 启动预取；元素最多隐藏 350ms，超时直接显示；
 * 4. 系统开启「减少动态效果」时完全跳过；
 * 5. 只动 transform / opacity，且不做在祖先容器上，避免破坏 sticky / fixed。
 */
import type { DirectiveBinding, ObjectDirective } from 'vue'
import { loadGsap, nearViewport, prefersReducedMotion } from '@/utils/motion'

interface RevealValue {
  delay?: number
  y?: number
  duration?: number
}

function parseValue(binding: DirectiveBinding<number | RevealValue | undefined>): RevealValue {
  const value = binding.value
  if (typeof value === 'number') return { delay: value }
  return value ?? {}
}

/** 最多等 GSAP 这么久，超时就按静态显示 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([promise, new Promise<null>((resolve) => window.setTimeout(() => resolve(null), ms))])
}

export const revealDirective: ObjectDirective<HTMLElement, number | RevealValue | undefined> = {
  async mounted(el, binding) {
    if (prefersReducedMotion()) return

    const { delay = 0, y = 16, duration = 0.5 } = parseValue(binding)
    const onScreen = nearViewport(el)

    el.style.opacity = '0'
    const gsap = await withTimeout(loadGsap(), 350)
    if (!gsap || !el.isConnected) {
      el.style.opacity = ''
      return
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: onScreen ? y : 0 },
      {
        opacity: 1,
        y: 0,
        duration,
        delay: delay / 1000,
        ease: 'power2.out',
        clearProps: 'opacity,transform',
      },
    )
  },
  unmounted(el) {
    el.style.opacity = ''
  },
}
