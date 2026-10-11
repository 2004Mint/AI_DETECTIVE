<script setup lang="ts">
/**
 * 图片放大查看（灯箱 · 支持自由缩放与平移）
 *
 * 为什么需要它：对战卡片用 `object-cover` 居中裁切，手机屏幕又小，
 * 单纯「铺满全屏」能看到的细节很有限。这里可以放大到 6 倍并自由拖动，
 * 而且展示的是**完整未裁切**的原图。
 *
 * 操作方式（桌面端 / 手机端共用同一套手势逻辑，基于 Pointer Events）：
 * - 手机：双指捏合缩放（以双指中心为锚点）、单指拖动平移、双击快速放大/还原；
 * - 电脑：鼠标滚轮缩放（以光标位置为锚点）、按住拖动平移、双击快速放大/还原；
 * - 关闭：点空白处 / 点右上角关闭按钮 / 按 Esc。
 *
 * ⚠️ 这里只展示图片本身，不接收也不显示任何「哪张是 AI」的信息，
 * 避免放大查看变成变相作弊。
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RotateCcw, X } from 'lucide-vue-next'
import type { Side } from '@/types/game'
import { clampTranslation, MIN_SCALE, zoomAtPoint } from '@/utils/imageZoom'
import type { ZoomViewport } from '@/utils/imageZoom'

const props = defineProps<{
  /** 是否显示 */
  visible: boolean
  /** A 或 B */
  side: Side
  /** 图片地址 */
  src: string
}>()

const emit = defineEmits<{
  /** 关闭放大查看 */
  close: []
}>()

/* ---------------- 缩放参数 ---------------- */
/** 双击放大到的倍数（倍数上下限见 utils/imageZoom.ts） */
const DOUBLE_TAP_SCALE = 2.6
/** 判定「拖动」而非「轻点」的位移阈值（px） */
const MOVE_THRESHOLD = 6
/** 双击判定时间窗（ms） */
const DOUBLE_TAP_MS = 320

const stageRef = ref<HTMLElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

const scale = ref(1)
const tx = ref(0)
const ty = ref(0)
/** 双击 / 复位 / 转屏时开过渡，捏合与拖动时关过渡（跟手才自然） */
const smooth = ref(false)
const dragging = ref(false)

const zoomed = computed(() => scale.value > MIN_SCALE + 0.01)

const imgStyle = computed(() => ({
  transform: `translate3d(${tx.value}px, ${ty.value}px, 0) scale(${scale.value})`,
  transition: smooth.value ? 'transform 0.22s cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none',
}))

let smoothTimer: number | undefined
function flashSmooth() {
  smooth.value = true
  if (smoothTimer) window.clearTimeout(smoothTimer)
  smoothTimer = window.setTimeout(() => {
    smooth.value = false
  }, 260)
}

/** 读取一次舞台与图片的几何信息（换算逻辑都在 utils/imageZoom.ts） */
function readViewport(): ZoomViewport | null {
  const stage = stageRef.value
  const img = imgRef.value
  if (!stage || !img) return null
  const rect = stage.getBoundingClientRect()
  return {
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
    width: stage.clientWidth,
    height: stage.clientHeight,
    contentWidth: img.offsetWidth,
    contentHeight: img.offsetHeight,
  }
}

/**
 * 以屏幕上某一点为锚点缩放（滚轮的光标位置 / 双指中心都走这里）。
 * 锚点底下的画面保持不动，因此「捏哪里就放大哪里」。
 */
function zoomAt(nextScale: number, clientX: number, clientY: number, animate = false) {
  const viewport = readViewport()
  if (!viewport) return
  const next = zoomAtPoint(
    { scale: scale.value, tx: tx.value, ty: ty.value },
    viewport,
    nextScale,
    clientX,
    clientY,
  )
  scale.value = next.scale
  tx.value = next.tx
  ty.value = next.ty
  if (animate) flashSmooth()
}

/** 平移到指定偏移（超出图片范围会被收敛回边界内） */
function panTo(nextTx: number, nextTy: number) {
  const viewport = readViewport()
  if (!viewport) return
  const clamped = clampTranslation(scale.value, nextTx, nextTy, viewport)
  tx.value = clamped.tx
  ty.value = clamped.ty
}

/** 还原到「适配屏幕」状态 */
function reset(animate = true) {
  if (animate) flashSmooth()
  scale.value = MIN_SCALE
  tx.value = 0
  ty.value = 0
}

/* ---------------- 手势（Pointer Events：鼠标 / 触摸共用一套逻辑） ---------------- */

interface PointerInfo {
  x: number
  y: number
  startX: number
  startY: number
  startTime: number
  moved: boolean
}

const pointers = new Map<number, PointerInfo>()
/** 捏合基准：起始双指距离 + 起始倍数 */
let pinchBase: { distance: number; scale: number } | null = null
/** 单指拖动基准 */
let dragBase: { x: number; y: number; tx: number; ty: number } | null = null
/** 上一次「轻点」的时间与位置，用于双击检测 */
let lastTap = { time: 0, x: 0, y: 0 }
/** 本次手势是否发生过位移（用于区分轻点与拖动） */
let gestureMoved = false

function pointerList(): PointerInfo[] {
  return [...pointers.values()]
}

function distanceOf(a: PointerInfo, b: PointerInfo): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function beginPinch() {
  const list = pointerList()
  const a = list[0]
  const b = list[1]
  if (!a || !b) return
  pinchBase = { distance: Math.max(1, distanceOf(a, b)), scale: scale.value }
  dragBase = null
}

function onPointerDown(event: PointerEvent) {
  const stage = stageRef.value
  if (!stage) return

  // 捕获指针：手指滑出图片甚至滑出元素后仍能持续收到 move 事件
  if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId)

  smooth.value = false
  pointers.set(event.pointerId, {
    x: event.clientX,
    y: event.clientY,
    startX: event.clientX,
    startY: event.clientY,
    startTime: Date.now(),
    moved: false,
  })
  dragging.value = true

  if (pointers.size === 1) {
    gestureMoved = false
    dragBase = { x: event.clientX, y: event.clientY, tx: tx.value, ty: ty.value }
    pinchBase = null
  } else if (pointers.size === 2) {
    gestureMoved = true
    beginPinch()
  }
}

function onPointerMove(event: PointerEvent) {
  const info = pointers.get(event.pointerId)
  if (!info) return

  info.x = event.clientX
  info.y = event.clientY
  if (Math.hypot(event.clientX - info.startX, event.clientY - info.startY) > MOVE_THRESHOLD) {
    info.moved = true
    gestureMoved = true
  }

  // 双指捏合：先算新倍数，再以双指中心为锚点应用（中心移动时图片会跟着走）
  if (pointers.size >= 2 && pinchBase) {
    const list = pointerList()
    const a = list[0]
    const b = list[1]
    if (!a || !b) return
    const midX = (a.x + b.x) / 2
    const midY = (a.y + b.y) / 2
    zoomAt(pinchBase.scale * (distanceOf(a, b) / pinchBase.distance), midX, midY)
    return
  }

  // 单指拖动：仅在放大后生效（适配屏幕时无处可拖）
  if (pointers.size === 1 && dragBase && zoomed.value) {
    panTo(
      dragBase.tx + (event.clientX - dragBase.x),
      dragBase.ty + (event.clientY - dragBase.y),
    )
  }
}

function onPointerUp(event: PointerEvent) {
  const info = pointers.get(event.pointerId)
  if (!info) return
  pointers.delete(event.pointerId)

  const stage = stageRef.value
  if (stage?.hasPointerCapture?.(event.pointerId)) {
    stage.releasePointerCapture(event.pointerId)
  }

  if (pointers.size === 0) {
    dragging.value = false
    pinchBase = null
    dragBase = null
    detectDoubleTap(info, event)
    return
  }

  // 还有手指留在屏幕上：以剩余手指重建基准，避免手指增减时画面跳变
  if (pointers.size === 1) {
    const remaining = pointerList()[0]
    if (remaining) {
      dragBase = { x: remaining.x, y: remaining.y, tx: tx.value, ty: ty.value }
    }
    pinchBase = null
  } else if (pointers.size >= 2) {
    beginPinch()
  }
}

/** 双击（触屏双击 / 鼠标双击都走这里）快速放大或还原 */
function detectDoubleTap(info: PointerInfo, event: PointerEvent) {
  const isTap = !info.moved && Date.now() - info.startTime < 300
  if (!isTap) {
    lastTap = { time: 0, x: 0, y: 0 }
    return
  }

  const now = Date.now()
  const nearLast = Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) < 40
  if (now - lastTap.time < DOUBLE_TAP_MS && nearLast) {
    lastTap = { time: 0, x: 0, y: 0 }
    if (zoomed.value) reset(true)
    else zoomAt(DOUBLE_TAP_SCALE, event.clientX, event.clientY, true)
    return
  }
  lastTap = { time: now, x: event.clientX, y: event.clientY }
}

/** 滚轮缩放：以光标位置为锚点，指数曲线让触控板的细碎滚动也顺滑 */
function onWheel(event: WheelEvent) {
  event.preventDefault()
  smooth.value = false
  zoomAt(scale.value * Math.exp(-event.deltaY * 0.0016), event.clientX, event.clientY)
}

/** 点空白处关闭（点在图片上、或刚拖动过都不关） */
function onStageClick(event: MouseEvent) {
  if (event.target !== stageRef.value) return
  if (gestureMoved) return
  emit('close')
}

/* ---------------- 开关与生命周期 ---------------- */

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

/** 转屏 / 改窗口大小时重新适配，避免停在错误的缩放位置 */
function onResize() {
  reset(false)
}

watch(
  () => props.visible,
  (open) => {
    if (open) {
      reset(false)
      pointers.clear()
      pinchBase = null
      dragBase = null
      lastTap = { time: 0, x: 0, y: 0 }
      gestureMoved = false
      document.addEventListener('keydown', onKeydown)
      window.addEventListener('resize', onResize)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = ''
    }
  },
)

onBeforeUnmount(() => {
  if (smoothTimer) window.clearTimeout(smoothTimer)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 bg-night-deep/95 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="`放大查看图片 ${side}`"
      >
        <!-- 缩放舞台：铺满视口、图片居中。
             touch-none 关掉浏览器自身的滚动与手势缩放，全部交给下面的手势逻辑 -->
        <div
          ref="stageRef"
          class="absolute inset-0 grid touch-none select-none place-items-center overflow-hidden p-3"
          :class="zoomed ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
          @wheel.prevent="onWheel"
          @click="onStageClick"
        >
          <img
            ref="imgRef"
            :src="src"
            :alt="`图片${side}（放大查看）`"
            class="max-h-full max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/20 will-change-transform"
            :style="imgStyle"
            draggable="false"
          />
        </div>

        <!-- 顶部：图片标识 + 当前倍数 + 复位 / 关闭 -->
        <div
          class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4"
        >
          <span
            class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-slate-100 backdrop-blur"
          >
            图片 {{ side }}
          </span>

          <div class="flex items-center gap-2">
            <span
              v-if="zoomed"
              class="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-xs font-black text-amber-200 backdrop-blur"
            >
              {{ scale.toFixed(1) }}×
            </span>
            <button
              v-if="zoomed"
              type="button"
              class="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-slate-200 backdrop-blur transition hover:bg-white/20 active:scale-90"
              aria-label="还原到适配屏幕"
              @click="reset(true)"
            >
              <RotateCcw :size="18" />
            </button>
            <button
              type="button"
              class="pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-slate-200 backdrop-blur transition hover:bg-white/20 active:scale-90"
              aria-label="关闭放大查看"
              @click="emit('close')"
            >
              <X :size="20" />
            </button>
          </div>
        </div>

        <!-- 底部：操作提示 -->
        <p
          class="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-5 text-center text-[11px] leading-relaxed text-slate-400"
        >
          手机<b class="text-slate-200">双指捏合</b>放大 · 电脑<b class="text-slate-200">滚轮</b>缩放 ·
          拖动平移 · <b class="text-slate-200">双击</b>快速放大 · 点空白处或按 Esc 关闭
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
