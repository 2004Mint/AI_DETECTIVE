<script setup lang="ts">
/**
 * AI 造梦事务所 · 创意灵感留言板
 *
 * ⚠️ 轻量化改版后首页不再展示留言板（属于「功能过多」的删减项），
 * 但组件、store 与 localStorage 数据都保留：需要时可以把它放回任意页面。
 *
 * 参与者可以留下「喜欢的作品 / 想让 AI 实现的创意 / 对作品的评价」。
 *
 * 安全与合规：
 * - 只收一个选填昵称，不收手机号、真实姓名等个人信息（输入框也做了提示）；
 * - 内容按纯文本存储，模板里全部用 `{{ }}` 插值，Vue 会自动转义，不会执行 HTML；
 * - 长度 4~120 字，提交前统一清洗控制字符；
 * - 每条留言带 `status`，默认「待审核」，管理员接口预留在 store 里。
 *
 * 已知限制：没有后端，留言只在本机 localStorage，换设备看不到。
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { MessageCircle, Send } from 'lucide-vue-next'
import EmptyState from './EmptyState.vue'
import {
  allWorks,
  formatRelativeTime,
  MESSAGE_MAX,
  NICKNAME_MAX,
} from '@/utils/dream'
import { useDreamStore } from '@/stores/dream'

const props = withDefaults(
  defineProps<{
    /** 限定只显示 / 只提交到某件作品（详情页用） */
    workId?: string
    workTitle?: string
    /** 紧凑模式 */
    compact?: boolean
    /** 最多展示几条（首页预览用） */
    limit?: number
  }>(),
  { workId: '', workTitle: '', compact: false, limit: 0 },
)

const store = useDreamStore()

const content = ref('')
const nickname = ref('')
const selectedWorkId = ref('')
const error = ref('')
const success = ref(false)
let successTimer: number | undefined

const works = allWorks()
const charCount = computed(() => [...content.value].length)
const overLimit = computed(() => charCount.value > MESSAGE_MAX)

const visibleMessages = computed(() => {
  const source = props.workId
    ? store.messages.filter((message) => message.workId === props.workId)
    : store.messages
  return props.limit > 0 ? source.slice(0, props.limit) : source
})

function selectWorkTitle(workId: string): string | undefined {
  if (!workId) return undefined
  return works.find((work) => work.id === workId)?.title
}

function submit() {
  error.value = ''
  success.value = false

  const workId = props.workId || selectedWorkId.value
  const result = store.addMessage({
    content: content.value,
    nickname: nickname.value,
    workId: workId || undefined,
    workTitle: props.workId ? props.workTitle : selectWorkTitle(selectedWorkId.value),
  })

  if (!result.ok) {
    error.value = result.error
    return
  }

  content.value = ''
  nickname.value = ''
  success.value = true
  if (successTimer) window.clearTimeout(successTimer)
  successTimer = window.setTimeout(() => {
    success.value = false
  }, 3200)
}

onBeforeUnmount(() => {
  if (successTimer) window.clearTimeout(successTimer)
})
</script>

<template>
  <section class="dream-card overflow-hidden">
    <!-- 头部 -->
    <div
      class="flex items-start justify-between gap-3 border-b border-white/5 px-4 sm:px-5"
      :class="compact ? 'py-3' : 'py-4'"
    >
      <div class="min-w-0">
        <p class="dream-kicker flex items-center gap-1.5">
          <MessageCircle :size="11" aria-hidden="true" />
          IDEAS · 创意留言
        </p>
        <p class="mt-1.5 text-[13px] font-bold text-white">
          {{ workId ? '说说这件作品' : '把你的想法留在这里' }}
        </p>
        <p class="mt-1 text-[10px] leading-5 text-slate-500">
          不用登录，也不用留真实姓名；留言会先进入待审核列表。
        </p>
      </div>
      <span class="dream-chip shrink-0 tabular-nums">{{ store.messageCount }} 条</span>
    </div>

    <!-- 表单 -->
    <div class="px-4 py-4 sm:px-5">
      <label class="sr-only" :for="`dream-message-${workId || 'all'}`">留言内容</label>
      <textarea
        :id="`dream-message-${workId || 'all'}`"
        v-model="content"
        class="dream-field min-h-[88px]"
        :class="overLimit ? '!border-rose-400' : ''"
        :maxlength="MESSAGE_MAX"
        rows="3"
        placeholder="例如：想看看 AI 画的老校区 / 这件作品的配色我很喜欢 / 想让 AI 帮我写一首关于夏天的短诗……"
        @keydown.ctrl.enter.prevent="submit"
        @keydown.meta.enter.prevent="submit"
      />

      <div class="mt-2.5 flex flex-wrap items-center gap-2">
        <input
          v-model="nickname"
          type="text"
          class="dream-field !w-auto min-w-0 flex-1 !px-3 !py-2 text-[12px] sm:max-w-[11rem]"
          :maxlength="NICKNAME_MAX"
          placeholder="昵称（选填，别填真名）"
          aria-label="昵称（选填）"
        />

        <select
          v-if="!workId && works.length > 0"
          v-model="selectedWorkId"
          class="dream-field !w-auto min-w-0 flex-1 !px-3 !py-2 text-[12px] sm:max-w-[13rem]"
          aria-label="想聊哪件作品（选填）"
        >
          <option value="">不指定作品</option>
          <option v-for="work in works" :key="work.id" :value="work.id">
            {{ work.title }}
          </option>
        </select>

        <span
          class="ml-auto shrink-0 text-[10px] tabular-nums"
          :class="overLimit ? 'font-bold text-rose-300' : 'text-slate-600'"
        >
          {{ charCount }}/{{ MESSAGE_MAX }}
        </span>
      </div>

      <div class="mt-3 flex items-center gap-3">
        <button
          type="button"
          class="dream-btn dream-btn-primary !py-2.5 text-[13px]"
          :disabled="overLimit"
          @click="submit"
        >
          <Send :size="14" aria-hidden="true" />
          留下想法
        </button>
        <p class="text-[10px] text-slate-600">Ctrl / ⌘ + Enter 快速发送</p>
      </div>

      <p v-if="error" class="mt-2.5 text-[11px] font-semibold text-rose-300" role="alert">
        {{ error }}
      </p>
      <p v-if="success" class="mt-2.5 text-[11px] font-semibold text-emerald-300" role="status">
        收到啦，谢谢你的分享（已进入待审核）
      </p>
    </div>

    <!-- 列表 -->
    <div class="border-t border-white/5 px-4 py-4 sm:px-5">
      <div v-if="visibleMessages.length === 0">
        <EmptyState
          compact
          :title="workId ? '这件作品还没有留言' : '还没有人留言'"
          hint="做第一个留下想法的人吧 —— 想让 AI 实现什么，写下来就行。"
        />
      </div>

      <ul v-else class="space-y-2.5">
        <li
          v-for="message in visibleMessages"
          :key="message.id"
          class="rounded-2xl border border-white/5 bg-white/5 px-3.5 py-3"
        >
          <div class="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] text-slate-500">
            <span class="font-bold text-slate-300">{{ message.nickname || '匿名同学' }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ formatRelativeTime(message.createdAt) }}</span>
            <span v-if="message.workTitle" class="dream-chip !px-2 !py-0.5">
              《{{ message.workTitle }}》
            </span>
            <span
              v-if="message.status === 'pending'"
              class="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[9px] font-bold text-amber-300"
            >
              待审核 · 仅本机可见
            </span>
          </div>
          <p class="mt-1.5 whitespace-pre-wrap break-words text-[12.5px] leading-6 text-slate-300">
            {{ message.content }}
          </p>
        </li>
      </ul>

      <p class="mt-3 text-[10px] leading-5 text-slate-600">
        留言保存在这台设备的浏览器里，换设备或清缓存会丢失；正式上线会接入服务端与人工审核。
      </p>
    </div>
  </section>
</template>
