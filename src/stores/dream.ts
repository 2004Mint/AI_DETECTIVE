/**
 * AI 造梦事务所 · Pinia 状态
 *
 * 负责两件事：
 * 1. 投票（每台设备每件作品最多 1 票，防连续重复投票）；
 * 2. 创意留言（长度校验 + 待审核状态，预留管理员审核）。
 *
 * 数据只落在本机 localStorage（见 `utils/dreamStorage.ts`），
 * 没有服务端；页面会如实提示这一点，不做「实时人气」的假象。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { DreamMessage, DreamMessageStatus, DreamSubmitResult } from '@/types/dream'
import { validateMessage } from '@/utils/dream'
import type { MessageDraft } from '@/utils/dream'
import { readDreamSnapshot, writeDreamSnapshot } from '@/utils/dreamStorage'

/** 留言最多保留条数（与存储层保持一致） */
const MAX_MESSAGES = 200

export interface MessageInput extends MessageDraft {
  /** 关联作品 id（详情页留言时带上） */
  workId?: string
  /** 关联作品标题快照 */
  workTitle?: string
}

export const useDreamStore = defineStore('dream', () => {
  const snapshot = readDreamSnapshot()

  /** 作品 id → 本机票数 */
  const votes = ref<Record<string, number>>({ ...snapshot.votes })
  /** 本机留言，新的在前 */
  const messages = ref<DreamMessage[]>([...snapshot.messages])

  /* ---------------- getters ---------------- */

  /** 本机累计投出的票数 */
  const localVoteCount = computed(() =>
    Object.values(votes.value).reduce((sum, count) => sum + count, 0),
  )

  /** 本机留言总数 */
  const messageCount = computed(() => messages.value.length)

  /** 是否投过某件作品 */
  function hasVoted(workId: string): boolean {
    return (votes.value[workId] ?? 0) > 0
  }

  /** 本机给某件作品的票数 */
  function votesFor(workId: string): number {
    return votes.value[workId] ?? 0
  }

  /* ---------------- actions ---------------- */

  function persist() {
    writeDreamSnapshot({ votes: votes.value, messages: messages.value })
  }

  /**
   * 投票。每台设备对同一件作品只能投一次。
   * @returns 'ok' 投票成功；'already' 已经投过；'invalid' 参数不合法
   */
  function vote(workId: string): 'ok' | 'already' | 'invalid' {
    if (!workId) return 'invalid'
    if (hasVoted(workId)) return 'already'
    votes.value = { ...votes.value, [workId]: 1 }
    persist()
    return 'ok'
  }

  /** 提交留言：校验 → 存本机 → 状态默认「待审核」 */
  function addMessage(input: MessageInput): DreamSubmitResult {
    const checked = validateMessage({ content: input.content, nickname: input.nickname })
    if (!checked.ok) return { ok: false, error: checked.error }

    const message: DreamMessage = {
      id: createMessageId(),
      content: checked.content,
      nickname: checked.nickname,
      createdAt: new Date().toISOString(),
      status: 'pending',
    }
    const workId = input.workId?.trim()
    if (workId) {
      message.workId = workId
      message.workTitle = input.workTitle?.trim() || undefined
    }

    messages.value = [message, ...messages.value].slice(0, MAX_MESSAGES)
    persist()
    return { ok: true, message }
  }

  /* ---------------- 预留：管理员审核 ---------------- */

  /**
   * 修改留言审核状态（预留能力）。
   * 目前没有后台与登录，这里只是数据层接口；接入后端后应由服务端鉴权后调用。
   */
  function setMessageStatus(id: string, status: DreamMessageStatus): void {
    messages.value = messages.value.map((message) =>
      message.id === id ? { ...message, status } : message,
    )
    persist()
  }

  /** 删除一条留言（预留能力，同上） */
  function removeMessage(id: string): void {
    messages.value = messages.value.filter((message) => message.id !== id)
    persist()
  }

  /** 清空本机留言（预留能力） */
  function clearMessages(): void {
    messages.value = []
    persist()
  }

  return {
    votes,
    messages,
    localVoteCount,
    messageCount,
    hasVoted,
    votesFor,
    vote,
    addMessage,
    setMessageStatus,
    removeMessage,
    clearMessages,
  }
})

function createMessageId(): string {
  return `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
