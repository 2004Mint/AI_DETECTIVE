/**
 * 素材文件名解析（纯函数，零依赖）
 *
 * 命名规则（全工程 + 自检脚本共用同一套实现）：
 *
 * ```
 * animal_1.png  →  { category: 'animal',    token: 'animal_1',    order: 1 }
 * animal-2.jpg  →  { category: 'animal',    token: 'animal-2',    order: 2 }
 * street_food_3.webp → { category: 'street_food', token: 'street_food_3', order: 3 }
 * ```
 *
 * 即「题材 + 分隔符（`_` 或 `-`，可省略）+ 序号」，扩展名任意。
 * 不符合该命名的文件返回 null，由调用方告警并跳过。
 *
 * 本文件与 `./roundBuilder.ts` 一样刻意不 import 任何工程模块，
 * 因此可以用 `node --experimental-strip-types` 直接加载做批量自检（见 README「抽题自检」）。
 */

export interface ParsedAssetName {
  /** 题材键：序号之前的部分（统一转小写），例如 animal / street_food */
  category: string
  /** 素材令牌：不带扩展名的完整文件名，例如 animal_1 */
  token: string
  /** 文件名末尾的序号，用于稳定排序 */
  order: number
}

/** 「题材 + 可选分隔符 + 序号」；序号必须是文件名结尾 */
const NAME_PATTERN = /^(.*?)[_-]?(\d+)$/

/**
 * 从文件路径解析题材与序号。
 * @param filePath 完整路径或文件名，Windows / POSIX 分隔符均可
 * @returns 解析结果；命名不符合规则时返回 null
 */
export function parseAssetName(filePath: string): ParsedAssetName | null {
  const normalized = filePath.replace(/\\/g, '/')
  const file = normalized.slice(normalized.lastIndexOf('/') + 1)
  const dot = file.lastIndexOf('.')
  const stem = dot > 0 ? file.slice(0, dot) : file

  const matched = NAME_PATTERN.exec(stem)
  if (!matched) return null

  const category = (matched[1] ?? '').replace(/[_-]+$/, '').toLowerCase()
  const order = Number(matched[2])
  if (!category || !Number.isFinite(order)) return null

  return { category, token: stem, order }
}
