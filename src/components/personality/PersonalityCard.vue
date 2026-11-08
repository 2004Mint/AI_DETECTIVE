<script setup lang="ts">
/**
 * AI 人格研究所 · 结果档案卡
 *
 * 版式：票根式档案。上半截是「票头」（编号 / 名称 / 宣言 / 关键词），
 * 中间一条打孔撕票线（卡片左右两侧真的挖了两个半圆缺口），下半截是正文。
 *
 * 动效：GSAP 时间线（只在结果页按需加载，其它页面零成本）——
 * 卡片 3D 抬起 → 徽标弹出 → 名称逐字浮起 → 撕票线展开 → 正文分段淡入；
 * 之后常驻一条沿卡片边框游走的主题色光带 + 缓慢呼吸的辉光。
 * 用户开了「减少动态效果」时整套动画直接跳过。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import { Compass, Dices, Eye, HeartHandshake, Moon, PartyPopper, Sparkles, Zap } from 'lucide-vue-next'
import { PERSONALITIES } from '@/data/personality/personalities'
import type { PersonalityKey, PersonalityResult } from '@/types/personality'

const props = defineProps<{
  result: PersonalityResult
  /** 样本编号，例如 0473（由答案推导，同一组答案永远一样） */
  sampleNo: string
}>()

/** 每种人格一个可识别的图标 */
const ICONS: Record<PersonalityKey, Component> = {
  creator: Sparkles,
  observer: Eye,
  explorer: Compass,
  healer: HeartHandshake,
  host: PartyPopper,
  doer: Zap,
  dreamer: Moon,
  player: Dices,
}

const NAMES = Object.fromEntries(PERSONALITIES.map((item) => [item.key, item.name])) as Record<
  PersonalityKey,
  string
>
const ACCENTS = Object.fromEntries(PERSONALITIES.map((item) => [item.key, item.accent])) as Record<
  PersonalityKey,
  string
>

const personality = computed(() => props.result.personality)
const icon = computed(() => ICONS[personality.value.key])
const nameChars = computed(() => [...personality.value.name])

/** 倾向构成：取分数最高的三种，细条表示相对强度 */
const tendency = computed(() => {
  const entries = Object.entries(props.result.scores) as Array<[PersonalityKey, number]>
  const top = Math.max(1, props.result.topScore)
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, score]) => ({
      key,
      name: NAMES[key],
      accent: ACCENTS[key],
      percent: Math.round((score / top) * 100),
    }))
})

/* ---------------- 动效 ---------------- */

const cardEl = ref<HTMLElement | null>(null)
const headEl = ref<HTMLElement | null>(null)
const perfEl = ref<HTMLElement | null>(null)
const codeEl = ref<HTMLElement | null>(null)
const badgeEl = ref<HTMLElement | null>(null)
const glowEl = ref<HTMLElement | null>(null)
const shineEl = ref<HTMLElement | null>(null)

let cleanup: (() => void) | null = null

/** 编号出现时先乱码再定型，像档案正在被解密 */
function scramble(el: HTMLElement, text: string): void {
  const pool = '0123456789ABCDEF#*'
  let frame = 0
  const total = 14
  const timer = window.setInterval(() => {
    frame += 1
    if (frame >= total) {
      window.clearInterval(timer)
      el.textContent = text
      return
    }
    const reveal = Math.floor((frame / total) * text.length)
    el.textContent =
      text.slice(0, reveal) +
      [...text.slice(reveal)].map(() => pool[Math.floor(Math.random() * pool.length)]).join('')
  }, 38)
}

onMounted(async () => {
  const card = cardEl.value
  const perf = perfEl.value
  if (!card) return

  // 撕票口的缺口位置跟着实际排版走（名称可能换行）
  const syncNotch = (): void => {
    if (!perf) return
    card.style.setProperty('--notch-y', `${perf.offsetTop + 1}px`)
  }
  syncNotch()
  const observer = new ResizeObserver(syncNotch)
  observer.observe(card)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return

  const { gsap } = await import('gsap')

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.from(card, {
      y: 24,
      opacity: 0,
      scale: 0.97,
      rotateX: 5,
      transformPerspective: 900,
      duration: 0.55,
    })
      .from(
        headEl.value ? headEl.value.querySelectorAll('.pl-eyebrow, .pl-serial') : [],
        { y: -6, opacity: 0, duration: 0.28, stagger: 0.04 },
        '-=0.34',
      )
      .from(badgeEl.value, { scale: 0.4, opacity: 0, rotate: -24, duration: 0.45, ease: 'back.out(2.4)' }, '-=0.24')
      .from(
        card.querySelectorAll('.pl-char'),
        { y: 14, opacity: 0, duration: 0.34, stagger: 0.018 },
        '-=0.3',
      )
      .from('.pl-decl-wrap', { y: 8, opacity: 0, duration: 0.3 }, '-=0.22')
      .from('.pl-chip', { y: 6, opacity: 0, duration: 0.26, stagger: 0.035 }, '-=0.18')
      .from(perf, { scaleX: 0, transformOrigin: 'left center', duration: 0.38 }, '-=0.16')
      .from('.pl-body > *', { y: 10, opacity: 0, duration: 0.32, stagger: 0.05 }, '-=0.22')
      .from('.pl-tend-fill', { scaleX: 0, transformOrigin: 'left center', duration: 0.55, stagger: 0.07 }, '-=0.5')

    if (codeEl.value) scramble(codeEl.value, personality.value.code)

    /* 常驻：光带转圈 + 辉光呼吸 + 星尘上浮 */
    gsap.to(card, { '--beam-angle': '360deg', duration: 6, repeat: -1, ease: 'none' })
    if (glowEl.value) {
      gsap.to(glowEl.value, { opacity: 0.62, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' })
    }
    if (shineEl.value) {
      gsap.fromTo(
        shineEl.value,
        { xPercent: -180, opacity: 0 },
        {
          xPercent: 460,
          opacity: 1,
          duration: 1.15,
          ease: 'power2.inOut',
          delay: 0.12,
          onComplete: () => gsap.set(shineEl.value, { opacity: 0 }),
        },
      )
    }
    card.querySelectorAll<HTMLElement>('.pl-spark').forEach((spark, index) => {
      gsap.fromTo(
        spark,
        { y: 16, opacity: 0 },
        {
          y: -70,
          opacity: 0.85,
          duration: 4.5 + (index % 5) * 0.9,
          delay: index * 0.35,
          repeat: -1,
          ease: 'sine.out',
        },
      )
    })
  }, card)

  cleanup = () => {
    ctx.revert()
    observer.disconnect()
  }
})

onBeforeUnmount(() => {
  cleanup?.()
})
</script>

<template>
  <article ref="cardEl" class="pl-card" :style="{ '--accent': personality.accent }">
    <!-- 沿边框游走的光带 + 入场时扫过卡面的一道光 -->
    <span class="pl-beam" aria-hidden="true" />
    <span ref="shineEl" class="pl-shine" aria-hidden="true" />

    <!-- 顶部辉光 + 星尘 -->
    <span ref="glowEl" class="pl-glow" aria-hidden="true" />
    <span class="pl-stars" aria-hidden="true">
      <i
        v-for="n in 14"
        :key="n"
        class="pl-spark"
        :style="{
          left: `${(n * 37) % 94 + 3}%`,
          top: `${(n * 53) % 80 + 12}%`,
          animationDelay: `${(n % 7) * 0.4}s`,
        }"
      />
    </span>

    <!-- 票头 -->
    <div ref="headEl" class="pl-head relative">
      <div class="flex items-baseline justify-between">
        <span class="pl-eyebrow">AI PERSONALITY FILE</span>
        <span class="pl-serial">NO.{{ sampleNo }}</span>
      </div>

      <div class="mt-4 flex items-start gap-3">
        <span ref="badgeEl" class="pl-badge">
          <component :is="icon" :size="20" :stroke-width="2" aria-hidden="true" />
        </span>

        <div class="min-w-0 flex-1">
          <p class="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em]">
            <span ref="codeEl" class="text-[var(--accent)] tabular-nums">{{ personality.code }}</span>
            <span class="h-[3px] w-[3px] rounded-full bg-white/25" aria-hidden="true" />
            <span class="text-white/40">{{ personality.en }}</span>
          </p>

          <h1 class="pl-name mt-1.5">
            <span v-for="(char, index) in nameChars" :key="index" class="pl-char">{{ char }}</span>
          </h1>
        </div>
      </div>

      <div class="pl-decl-wrap mt-4">
        <p class="pl-decl">{{ personality.declaration }}</p>
      </div>

      <ul class="mt-3.5 flex flex-wrap gap-1.5">
        <li v-for="word in personality.keywords" :key="word" class="pl-chip">{{ word }}</li>
      </ul>

      <!-- 撕票线（卡片左右缺口的位置由它决定） -->
      <div ref="perfEl" class="pl-perf mt-5" aria-hidden="true" />
    </div>

    <!-- 正文 -->
    <div class="pl-body relative">
      <p class="text-[13px] leading-[1.9] text-white/70">{{ personality.description }}</p>

      <section class="mt-6">
        <p class="pl-label">TENDENCY</p>
        <div class="mt-3 grid gap-2.5">
          <div v-for="row in tendency" :key="row.key" class="flex items-center gap-2.5">
            <span class="w-[84px] shrink-0 truncate text-[10px] text-white/45">{{ row.name }}</span>
            <span class="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <span
                class="pl-tend-fill block h-full rounded-full"
                :style="{
                  width: `${row.percent}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${row.accent} 45%, transparent), ${row.accent})`,
                }"
              />
            </span>
          </div>
        </div>
      </section>

      <section class="mt-6">
        <p class="pl-label">BEHAVIOUR</p>
        <ol class="mt-3 grid gap-2.5">
          <li
            v-for="(trait, index) in personality.traits"
            :key="trait"
            class="flex items-baseline gap-2.5 text-[12.5px] leading-[1.7] text-white/75"
          >
            <span class="w-[15px] shrink-0 font-display text-[9.5px] font-bold tabular-nums text-white/30">
              0{{ index + 1 }}
            </span>
            <span class="min-w-0">{{ trait }}</span>
          </li>
        </ol>
      </section>

      <blockquote class="pl-quote mt-6">
        <p class="text-[13px] leading-[1.75] text-white/90">{{ personality.quote }}</p>
      </blockquote>
    </div>
  </article>
</template>
