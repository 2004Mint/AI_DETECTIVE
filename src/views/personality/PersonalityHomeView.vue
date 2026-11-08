<script setup lang="ts">
/**
 * AI 人格研究所 · 首页
 *
 * 只做一件事：让人愿意点「开始」。
 * 没有统计、没有排行榜、没有玩法长文——一行说明 + 一个按钮 + 一张样本档案。
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight } from 'lucide-vue-next'
import PersonalityShell from '@/components/personality/PersonalityShell.vue'
import MascotBubble from '@/components/MascotBubble.vue'
import { PERSONALITIES } from '@/data/personality/personalities'
import { QUESTION_COUNT } from '@/data/personality/questions'
import { usePersonalityStore } from '@/stores/personality'

const store = usePersonalityStore()
store.hydrate()

/** 答到一半回来的人，按钮文案改成「继续作答」 */
const resuming = computed(() => store.answeredCount > 0 && !store.complete)
</script>

<template>
  <PersonalityShell>
    <template #right>
      <span class="shrink-0 text-[10px] font-medium tracking-[0.18em] text-slate-500">EST. 2026</span>
    </template>

    <section class="pt-8 text-center" v-reveal="0">
      <p
        class="mx-auto inline-block rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[10px] font-semibold tracking-wide text-orange-200/80 backdrop-blur"
      >
        重庆外语外事学院 · 人工智能学生研讨与实践社
      </p>

      <h1 class="mt-6 font-display text-[30px] font-black leading-[1.25] tracking-tight text-white">
        发现你的<br />
        <span class="text-candy">隐藏人格</span>
      </h1>

      <p class="mt-4 text-[13px] leading-6 text-slate-400">
        {{ QUESTION_COUNT }} 道趣味问题，解锁你的专属 AI 人格
      </p>

      <p class="mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10.5px] text-slate-500">
        <span>无需注册</span>
        <span class="text-slate-700" aria-hidden="true">·</span>
        <span>约 1 分钟</span>
        <span class="text-slate-700" aria-hidden="true">·</span>
        <span>不收集任何个人信息</span>
      </p>

      <RouterLink
        :to="{ name: 'personality-quiz' }"
        class="btn-primary mt-7 w-full text-[15px]"
      >
        {{ resuming ? '继续人格探索' : '开始人格探索' }}
        <ArrowRight :size="17" aria-hidden="true" />
      </RouterLink>

      <p class="mt-3 text-[10px] text-slate-600">点一下就开始，没有注册，也没有考题</p>
    </section>

    <!-- 样本档案：八种人格的编号，纯装饰，同时暗示"有 8 种结果" -->
    <section class="glass mt-8 p-4" v-reveal="120">
      <div class="flex items-center justify-between">
        <p class="text-[10px] font-bold tracking-[0.22em] text-slate-500">SAMPLE ARCHIVE</p>
        <p class="text-[10px] text-slate-600">已收录 {{ PERSONALITIES.length }} 份人格样本</p>
      </div>

      <div class="mt-3 grid grid-cols-2 gap-1.5">
        <div
          v-for="item in PERSONALITIES"
          :key="item.key"
          class="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-2.5 py-2"
        >
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :style="{ background: item.accent }" aria-hidden="true" />
          <span class="shrink-0 text-[9.5px] font-bold tabular-nums text-slate-600">{{ item.code.slice(-2) }}</span>
          <span class="min-w-0 truncate text-[10.5px] text-slate-400">{{ item.name }}</span>
        </div>
      </div>
    </section>

    <!-- 研小鸿 -->
    <div class="mt-7 flex justify-center" v-reveal="200">
      <MascotBubble
        text="别紧张，这题没有标准答案。"
        size="sm"
        tone="dark"
        :floaty="false"
        :emotion="0"
      />
    </div>

    <p class="mt-6 text-center text-[10px] leading-5 text-slate-600">
      这是一个娱乐向的小互动，不是心理测评，也不会上传你的答案。
    </p>
  </PersonalityShell>
</template>
