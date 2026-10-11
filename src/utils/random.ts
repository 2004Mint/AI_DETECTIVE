/**
 * 随机数工具（纯函数，零依赖）
 *
 * 单独成文件的原因：抽题算法 `utils/roundBuilder.ts` 需要「可注入随机源」以便
 * 用固定种子做统计验证，而本文件与 roundBuilder 都不引用任何模块，
 * 因此可以被 `node --experimental-strip-types` 直接加载做批量自检
 * （见 README「抽题自检」）。
 */

/** 可注入的随机源：返回 [0, 1) 区间的浮点数，默认 Math.random */
export type RandomFn = () => number

/**
 * Fisher-Yates 洗牌（返回新数组，不修改原数组）
 * @param source 原数组
 * @param random 随机源，便于测试时注入固定序列
 */
export function shuffle<T>(source: readonly T[], random: RandomFn = Math.random): T[] {
  const arr = [...source]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

/** 随机取一个合法下标（结果一定落在 [0, length) 内；length <= 0 时返回 -1） */
export function randomIndex(length: number, random: RandomFn = Math.random): number {
  if (length <= 0) return -1
  const i = Math.floor(random() * length)
  if (i < 0) return 0
  return i >= length ? length - 1 : i
}

/** 从数组中随机取一项；数组为空时返回 undefined */
export function pickOne<T>(pool: readonly T[], random: RandomFn = Math.random): T | undefined {
  const i = randomIndex(pool.length, random)
  return i < 0 ? undefined : pool[i]
}
