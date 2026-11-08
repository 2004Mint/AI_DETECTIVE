<script setup lang="ts">
/**
 * AI 灵感游乐场 · 总入口
 *
 * 扫码进入后的第一个页面，只做一件事：把同学分流到各个活动板块。
 * 后续新增板块时，往 MODULES 里加一项即可（图标 + 渐变 + 文案 + 路由）。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Fingerprint, Plus, ScanSearch, Sparkles } from 'lucide-vue-next'
import type { Component } from 'vue'
import { useGameStore } from '@/stores/game'
import MascotBubble from '@/components/MascotBubble.vue'
import { playPortalIntro } from '@/utils/portalEnter'
import { enterWithWipe } from '@/utils/pageWipe'

/** 每张卡片的专属入场：scan 扫描 / float 浮起 / unfold 展开 */
type ModuleMotion = 'scan' | 'float' | 'unfold'

interface ParkModule {
  to: string
  name: string
  en: string
  desc: string
  icon: Component
  /** 图标底色渐变（Tailwind 完整类名） */
  tone: string
  /** 主题色：遮罩转场从这里取色 */
  accent: string
  /** 入场动效预设 */
  motion: ModuleMotion
}

const MODULES: readonly ParkModule[] = [
  {
    to: '/detective',
    name: 'AI 鉴定师',
    en: 'AI DETECTIVE',
    desc: '哪张图片由 AI 生成？3 关挑战你的火眼金睛',
    icon: ScanSearch,
    tone: 'from-amber-300 to-orange-500',
    accent: '#ff8a1c',
    motion: 'scan',
  },
  {
    to: '/dream-studio',
    name: 'AI 造梦事务所',
    en: 'DREAM STUDIO',
    desc: '线上 AI 作品展：看作品、读提示词、为喜欢的投票',
    icon: Sparkles,
    tone: 'from-rose-300 to-pink-500',
    accent: '#f472b6',
    motion: 'float',
  },
  {
    to: '/personality',
    name: 'AI 人格研究所',
    en: 'PERSONALITY LAB',
    desc: '5 道趣味问题，解锁你的专属 AI 人格档案',
    icon: Fingerprint,
    tone: 'from-violet-300 to-purple-500',
    accent: '#b9a6ff',
    motion: 'unfold',
  },
]

const router = useRouter()
const game = useGameStore()
/** 有未完成的挑战时，在鉴定师卡片上提示「继续」 */
const hasProgress = computed(() => game.status === 'playing' && game.questions.length > 0)

/**
 * 进入活动页：遮罩从被点的卡片铺开 → 跳转 → 收起露出新页面。
 * 按住 ⌘/Ctrl/Shift 或中键点击时交给浏览器默认行为（新标签页打开）。
 */
function onEnter(event: MouseEvent, item: ParkModule): void {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
  event.preventDefault()
  void enterWithWipe({
    el: event.currentTarget as HTMLElement,
    to: item.to,
    color: item.accent,
    title: item.name,
    subtitle: item.en,
    push: (to) => router.push(to),
  })
}

/* ---------------- 三张卡片各自的入场动画 ---------------- */

const navEl = ref<HTMLElement | null>(null)
let stopIntro: (() => void) | null = null

onMounted(async () => {
  const cards = navEl.value
    ? Array.from(navEl.value.querySelectorAll<HTMLElement>('[data-enter]'))
    : []
  stopIntro = await playPortalIntro(cards)
})

onBeforeUnmount(() => {
  stopIntro?.()
})
</script>

<template>
  <section
    class="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center px-6 pb-safe pt-9 text-center"
  >
    <!-- 社团横幅 -->
    <p
      class="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-orange-200/80 backdrop-blur" v-reveal="70"
    >
      🧠 重庆外语外事学院 · 人工智能学生研讨与实践社
    </p>

    <!-- 品牌标题 -->
    <h1 class="mt-7" v-reveal="0">
      <span
        class="text-candy block font-display text-[2.1rem] font-black italic tracking-[0.02em] sm:text-4xl"
      >
        AI 灵感游乐场
      </span>
      <span class="mt-2.5 block text-[9px] font-bold tracking-[0.34em] text-slate-500">
        AI INSPIRATION PARK
      </span>
    </h1>

    <!-- 研小鸿引导 -->
    <div class="relative mt-5 flex justify-center" v-reveal="60">
      <span class="absolute top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-brand/20 blur-3xl" aria-hidden="true" />
      <MascotBubble
        class="relative"
        text="今天想先去哪个？三个都能玩～"
        size="md"
        tone="dark"
        :floaty="false"
        :emotion="0"
      />
    </div>

    <!-- 板块入口 -->
    <nav ref="navEl" class="mt-7 grid w-full gap-3 text-left">
      <a
        v-for="item in MODULES"
        :key="item.to"
        :href="item.to"
        :data-enter="item.motion"
        class="glass group relative flex items-center gap-3.5 overflow-hidden p-4 transition-colors duration-200 hover:bg-white/10 active:scale-[0.99]"
        @click="onEnter($event, item)"
      >
        <!-- 三张卡各自的动效装饰：扫描线 / 斜向高光 / 顶部细线 -->
        <span v-if="item.motion === 'scan'" class="module-scan" aria-hidden="true" />
        <span v-if="item.motion === 'float'" class="module-shimmer" aria-hidden="true" />
        <span v-if="item.motion === 'unfold'" class="module-rule" aria-hidden="true" />
        <span
          v-if="item.motion === 'float'"
          class="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <i
            v-for="n in 3"
            :key="n"
            class="module-spark"
            :style="{ left: `${16 + n * 24}%`, top: `${50 + (n % 2) * 16}%` }"
          />
        </span>

        <span
          class="module-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-[#3d1d05] shadow-glow"
          :class="item.tone"
        >
          <component :is="item.icon" :size="22" :stroke-width="2.2" aria-hidden="true" />
        </span>

        <span class="min-w-0 flex-1">
          <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-[15px] font-black text-white">{{ item.name }}</span>
            <span
              v-if="item.to === '/detective' && hasProgress"
              class="rounded-full bg-brand/20 px-2 py-0.5 text-[9px] font-bold text-brand-light"
            >
              继续上次
            </span>
          </span>
          <span class="mt-1 block text-[11px] leading-5 text-slate-400">{{ item.desc }}</span>
          <span class="mt-1 block text-[8.5px] font-bold tracking-[0.22em] text-slate-600">
            {{ item.en }}
          </span>
        </span>

        <ChevronRight
          :size="16"
          class="shrink-0 text-slate-500 transition-colors group-hover:text-white"
          aria-hidden="true"
        />
      </a>

      <!-- 后续板块占位 -->
      <div
        class="flex items-center gap-3.5 rounded-2xl border border-dashed border-white/10 px-4 py-3.5"
        v-reveal="360"
      >
        <span
          class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-600"
        >
          <Plus :size="18" aria-hidden="true" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-[12px] font-bold text-slate-400">更多板块筹备中</span>
          <span class="mt-0.5 block text-[10px] text-slate-600">后续活动会陆续出现在这里</span>
        </span>
      </div>
    </nav>

    <!-- 页脚 -->
    <footer class="mt-auto pt-9" v-reveal="420">
      <p class="text-[11px] font-medium text-slate-500">
        重庆外语外事学院 · 人工智能学生研讨与实践社
      </p>
      <p class="mt-1 text-[10px] text-slate-600">扫码即玩 · 无需登录 · 手机优先</p>
    </footer>
  </section>
</template>

<style scoped>
/* 鉴定师：一道橙色扫描光横扫卡面 */
.module-scan {
  position: absolute;
  top: -12%;
  bottom: -12%;
  left: 0;
  width: 2px;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(180deg, transparent, #ffd08a 18%, #ff8a1c 50%, #ffd08a 82%, transparent);
  box-shadow: 0 0 16px rgba(255, 138, 28, 0.9);
}

/* 造梦：斜向高光 + 三粒星尘 */
.module-shimmer {
  position: absolute;
  top: -25%;
  bottom: -25%;
  left: 0;
  width: 34%;
  pointer-events: none;
  opacity: 0;
  transform: skewX(-14deg);
  background: linear-gradient(100deg, transparent, rgba(255, 214, 224, 0.22), transparent);
}

.module-spark {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  opacity: 0;
  background: #ffd0dc;
  box-shadow: 0 0 10px rgba(255, 160, 190, 0.9);
}

/* 人格：档案卡顶部画出的主题色细线 */
.module-rule {
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  border-radius: 2px;
  opacity: 0;
  transform-origin: left center;
  background: linear-gradient(90deg, #c4b5fd, rgba(196, 181, 253, 0.1));
}
</style>
