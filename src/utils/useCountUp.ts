/**
 * 数字滚动动画组合式函数（结算页分数用）
 * 返回 { display, run }：run 驱动 display 从 0 滚动到目标值（缓出）。
 */
import { onBeforeUnmount, ref } from 'vue'

export function useCountUp() {
  const display = ref(0)
  let rafId = 0

  function run(target: number, duration = 1200) {
    cancelAnimationFrame(rafId)
    const startTime = performance.now()
    const from = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      display.value = Math.round(from + (target - from) * eased)
      if (t < 1) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
  }

  onBeforeUnmount(() => cancelAnimationFrame(rafId))

  return { display, run }
}
