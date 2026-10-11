/**
 * 图片缩放 / 平移的纯数学（零依赖）
 *
 * 从 `ImageLightbox.vue` 里抽出来的原因：
 * - 「以某个锚点缩放时，锚点底下的画面必须保持不动」这段换算容易写错，
 *   单独成文件后可以用脚本精确验证（见 `projectPoint` 的往返关系）；
 * - 组件里只剩下手势状态机，读起来更清楚。
 *
 * ## 坐标约定
 * 舞台（stage）铺满视口，图片在 `scale = 1` 时居中适配，因此**图片中心 = 舞台中心 C**。
 * 变换写成 `translate(tx, ty) scale(s)`（transform-origin 默认在图片中心），于是：
 *
 * ```
 * 屏幕坐标 = C + (L - C) × s + t        L 为图片局部坐标，单位与屏幕一致
 * ```
 */

/** 1 = 适配屏幕（完整显示整张原图） */
export const MIN_SCALE = 1
/** 放大上限：手机屏幕小，留足余量才看得清细节 */
export const MAX_SCALE = 6

/** 当前缩放 / 平移状态 */
export interface ZoomTransform {
  /** 缩放倍数 */
  scale: number
  /** 水平平移量（px，屏幕坐标） */
  tx: number
  /** 垂直平移量（px，屏幕坐标） */
  ty: number
}

/** 舞台与内容的几何信息（每帧从 DOM 读一次） */
export interface ZoomViewport {
  /** 舞台中心的屏幕坐标 */
  centerX: number
  centerY: number
  /** 舞台可视尺寸 */
  width: number
  height: number
  /** 图片在 scale = 1 时的布局尺寸 */
  contentWidth: number
  contentHeight: number
}

function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

/** 把倍数收进 [MIN_SCALE, MAX_SCALE]；非法值（NaN / Infinity）按适配屏幕处理 */
export function clampScale(scale: number): number {
  if (!Number.isFinite(scale)) return MIN_SCALE
  return clamp(scale, MIN_SCALE, MAX_SCALE)
}

/**
 * 把平移量限制在图片范围内：
 * 某一方向放大后仍比舞台小，就在该方向回正居中（不允许把图片拖出屏幕）。
 */
export function clampTranslation(
  scale: number,
  tx: number,
  ty: number,
  viewport: ZoomViewport,
): { tx: number; ty: number } {
  const maxTx = Math.max(0, (viewport.contentWidth * scale - viewport.width) / 2)
  const maxTy = Math.max(0, (viewport.contentHeight * scale - viewport.height) / 2)
  return { tx: clamp(tx, -maxTx, maxTx), ty: clamp(ty, -maxTy, maxTy) }
}

/**
 * 以屏幕上某一点为锚点缩放到 `nextScale`
 * —— 滚轮的光标位置、双指的中心点都走这里，保证锚点底下的画面不移动。
 *
 * 推导：设当前倍数 s、平移 t，屏幕点 P 对应的图片局部坐标为
 * `L = C + (P - C - t) / s`。要让 L 在缩放后仍落在 P 上：
 *
 * ```
 * P = C + (L - C) × s' + t'
 * t' = (P - C) - (P - C - t) × (s' / s)
 * ```
 *
 * 最后再做一次边界收敛（贴边时锚点会略微偏移，这是所有看图工具的通行行为）。
 */
export function zoomAtPoint(
  current: ZoomTransform,
  viewport: ZoomViewport,
  nextScale: number,
  anchorX: number,
  anchorY: number,
): ZoomTransform {
  const target = clampScale(nextScale)
  const from = current.scale > 0 ? current.scale : MIN_SCALE
  const ratio = target / from
  const dx = anchorX - viewport.centerX
  const dy = anchorY - viewport.centerY
  const clamped = clampTranslation(
    target,
    dx - (dx - current.tx) * ratio,
    dy - (dy - current.ty) * ratio,
    viewport,
  )
  return { scale: target, tx: clamped.tx, ty: clamped.ty }
}

/** 图片局部坐标 → 屏幕坐标 */
export function projectPoint(
  transform: ZoomTransform,
  viewport: ZoomViewport,
  localX: number,
  localY: number,
): { x: number; y: number } {
  return {
    x: viewport.centerX + (localX - viewport.centerX) * transform.scale + transform.tx,
    y: viewport.centerY + (localY - viewport.centerY) * transform.scale + transform.ty,
  }
}

/** 屏幕坐标 → 图片局部坐标（projectPoint 的逆运算） */
export function unprojectPoint(
  transform: ZoomTransform,
  viewport: ZoomViewport,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  const scale = transform.scale > 0 ? transform.scale : MIN_SCALE
  return {
    x: viewport.centerX + (screenX - viewport.centerX - transform.tx) / scale,
    y: viewport.centerY + (screenY - viewport.centerY - transform.ty) / scale,
  }
}
