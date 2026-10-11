<script setup lang="ts">
/**
 * 社团招新页：AI 赋能各学科 → AI研习社 → 一起探索/学习/实践/创造 AI → 招新二维码位
 */
import { useRouter } from 'vue-router'
import {
  BookOpen,
  Clapperboard,
  Code,
  Compass,
  FlaskConical,
  Languages,
  Music,
  Palette,
  PenLine,
  RotateCcw,
  Rocket,
  Sparkles,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import { useGameStore } from '@/stores/game'
import MascotPet from '@/components/MascotPet.vue'

const router = useRouter()
const game = useGameStore()

/**
 * 招新二维码：放在 public/recruit-qr.png，用 BASE_URL 拼绝对路径
 * （跟着 vite.config.ts 的 base 走，子路径部署也不会 404）。
 * 换二维码只要替换 public/recruit-qr.png 这个文件，代码不用动。
 */
const QR_SRC = `${import.meta.env.BASE_URL}recruit-qr.png`

/** AI 正在进入的学科 */
const FIELDS: ReadonlyArray<{ label: string; icon: Component; color: string }> = [
  { label: '写作', icon: PenLine, color: 'from-rose-400/25 to-pink-500/10 text-rose-300' },
  { label: '设计', icon: Palette, color: 'from-orange-400/25 to-amber-500/10 text-orange-300' },
  { label: '编程', icon: Code, color: 'from-sky-400/25 to-blue-500/10 text-sky-300' },
  { label: '音乐', icon: Music, color: 'from-emerald-400/25 to-teal-500/10 text-emerald-300' },
  { label: '视频', icon: Clapperboard, color: 'from-amber-400/25 to-orange-500/10 text-amber-300' },
  { label: '外语', icon: Languages, color: 'from-cyan-400/25 to-teal-500/10 text-cyan-300' },
]

/** 研习社的四种姿态（暖橙 + 冷暖互补，与表情包同色系） */
const ACTS: ReadonlyArray<{ label: string; icon: Component; color: string }> = [
  { label: '探索 AI', icon: Compass, color: 'from-cyan-400 to-teal-500' },
  { label: '学习 AI', icon: BookOpen, color: 'from-yellow-400 to-amber-500' },
  { label: '实践 AI', icon: FlaskConical, color: 'from-rose-400 to-pink-600' },
  { label: '创造 AI', icon: Rocket, color: 'from-orange-400 to-amber-500' },
]

function replay() {
  game.startGame()
  router.push('/game')
}
</script>

<template>
  <section class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-safe pt-9">
    <!-- 主标题 -->
    <h1 class="text-center font-display text-3xl font-black leading-snug text-white">
      AI 不只是图片。
    </h1>

    <!-- 学科矩阵 -->
    <p class="mt-6 text-center text-xs font-bold tracking-[0.24em] text-slate-400">
      AI 正在进入
    </p>
    <div class="mt-3 grid grid-cols-3 gap-2.5">
      <div
        v-for="f in FIELDS"
        :key="f.label"
        class="glass flex flex-col items-center gap-2 rounded-2xl px-2 py-4 transition-transform duration-200 hover:-translate-y-1"
      >
        <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ring-1 ring-white/10" :class="f.color">
          <component :is="f.icon" :size="21" aria-hidden="true" />
        </span>
        <span class="text-sm font-bold text-slate-100">{{ f.label }}</span>
      </div>
    </div>

    <!-- 核心文案 -->
    <p class="text-candy animate-pop-in mx-auto mt-7 font-display text-xl font-black tracking-wide">
      “AI 正在进入每一个学科。”
    </p>

    <!-- 社团名片 -->
    <div class="glass animate-fade-up mt-7 flex items-center gap-4 p-5 [animation-delay:0.1s]">
      <MascotPet :size="92" class="animate-floaty shrink-0" />
      <div class="min-w-0">
        <p class="font-display text-2xl font-black tracking-wide text-white">
          AI 研习社<span class="ml-1.5 align-middle text-[10px] font-bold tracking-[0.2em] text-amber-300">AI LAB</span>
        </p>
        <p class="mt-1 text-[11px] font-medium leading-5 text-slate-300">
          重庆外语外事学院
          <br />
          人工智能学生研讨与实践社
        </p>
      </div>
    </div>

    <!-- 一起行动 -->
    <div class="animate-fade-up mt-6 grid grid-cols-2 gap-2.5 [animation-delay:0.18s]">
      <div
        v-for="a in ACTS"
        :key="a.label"
        class="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r px-4 py-3.5 shadow-card ring-1 ring-white/20"
        :class="a.color"
      >
        <component :is="a.icon" :size="18" aria-hidden="true" />
        <span class="font-display text-[15px] font-black text-white drop-shadow">{{ a.label }}</span>
      </div>
    </div>
    <p class="mt-3 text-center text-[11px] font-medium text-slate-400">
      无论你来自哪个专业，都欢迎和 AI 一起成长 🌱
    </p>

    <!-- 招新二维码 -->
    <div class="animate-fade-up mt-7 [animation-delay:0.26s]">
      <div class="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-orange-400/40 bg-brand/5 px-6 py-7 text-center">
        <!-- 二维码原图是深色底（约 341px），所以：
             ① 外面套一层白卡，保证识别率；② 点一下直接看原图，防止小屏渲染糊掉 -->
        <a
          :href="QR_SRC"
          target="_blank"
          rel="noopener"
          class="block rounded-2xl bg-white p-2.5 shadow-card ring-1 ring-white/60 transition active:scale-95"
          aria-label="查看招新二维码原图"
        >
          <img
            :src="QR_SRC"
            alt="AI 研习社招新二维码"
            class="w-44 rounded-xl"
			
            draggable="false"
            decoding="async"
          />
        </a>
        <div>
          <p class="font-display text-base font-black text-white">扫一扫 · 加入 AI 研习社</p>
          <p class="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <Sparkles :size="12" class="text-amber-300" aria-hidden="true" />
            tips:点击二维码看原图
          </p>
        </div>
        <p class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold tracking-widest text-orange-200">
          AI 不止于想象，更要一起玩出花样。
        </p>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="mt-8 flex flex-col gap-3">
      <button type="button" class="btn-primary w-full" @click="replay">
        <RotateCcw :size="18" aria-hidden="true" />
        再玩一次
      </button>
      <button type="button" class="btn-ghost w-full" @click="router.push('/')">返回首页</button>
    </div>
  </section>
</template>
