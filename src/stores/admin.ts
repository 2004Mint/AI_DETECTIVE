/**
 * AI 造梦事务所 · 后台工作区
 *
 * 只做「本机编辑」：作品数组 + 站点参数存 localStorage，
 * 上传的图片/音频存 IndexedDB；导出成文件后才进入代码库。
 */
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { DREAM_SITE } from '@/data/dream/site'
import { DREAM_WORKS } from '@/data/dream/works'
import type { DreamCategoryKey, DreamSiteConfig, DreamWork } from '@/types/dream'
import { compressImage, extensionOf } from '@/utils/adminAssets'
import {
  clearAssets,
  deleteAsset,
  getAsset,
  putAsset,
  readAdminSnapshot,
  writeAdminSnapshot,
} from '@/utils/adminStorage'
import { dreamCover } from '@/utils/dream'

export interface SaveWorkPayload {
  /** 编辑前的 id（新增时为 null） */
  originalId: string | null
  work: DreamWork
  /** 新选择的封面图片；不传表示不换 */
  coverFile?: File | null
  /** 新选择的音频；不传表示不换 */
  audioFile?: File | null
  /** 明确移除封面（且没有新文件） */
  clearCover?: boolean
  /** 明确移除音频（且没有新文件） */
  clearAudio?: boolean
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export const useAdminStore = defineStore('admin', () => {
  const works = ref<DreamWork[]>([])
  const site = ref<DreamSiteConfig>({ ...DREAM_SITE })
  /** 作品 id → 本机上传封面的 objectURL */
  const coverPreviews = ref<Record<string, string>>({})
  /** 作品 id → 是否上传过封面 / 音频 */
  const localCover = ref<Record<string, boolean>>({})
  const localAudio = ref<Record<string, boolean>>({})

  const hydrated = ref(false)
  const loading = ref(false)
  const savedAt = ref(0)
  const storageError = ref(false)

  /* ---------------- getters ---------------- */

  const totalVotes = computed(() =>
    works.value.reduce((sum, work) => sum + (work.voteCount ?? 0), 0),
  )

  const covered = computed(() => works.value.filter((work) => coverUrl(work)).length)

  const missingCover = computed(() => works.value.length - covered.value)

  const categoryCounts = computed<Record<DreamCategoryKey, number>>(() => {
    const counts: Record<DreamCategoryKey, number> = { visual: 0, text: 0, music: 0, idea: 0 }
    for (const work of works.value) {
      if (work.category in counts) counts[work.category] += 1
    }
    return counts
  })

  /** 作品封面地址：优先本机上传，其次仓库里的文件，最后空 */
  function coverUrl(work: DreamWork): string {
    return coverPreviews.value[`${work.id}:cover`] ?? (work.cover ? dreamCover(work) : '')
  }

  function hasLocalCover(id: string): boolean {
    return Boolean(localCover.value[id])
  }

  function hasLocalAudio(id: string): boolean {
    return Boolean(localAudio.value[id])
  }

  /* ---------------- 持久化 ---------------- */

  function persist(): void {
    const saved = writeAdminSnapshot({
      works: clone(works.value),
      site: { ...site.value },
      updatedAt: Date.now(),
    })
    storageError.value = !saved
    if (saved) savedAt.value = Date.now()
  }

  async function loadAssets(): Promise<void> {
    for (const work of works.value) {
      try {
        const cover = await getAsset(`${work.id}:cover`)
        if (cover) {
          coverPreviews.value = {
            ...coverPreviews.value,
            [`${work.id}:cover`]: URL.createObjectURL(cover),
          }
          localCover.value = { ...localCover.value, [work.id]: true }
        }
        const audio = await getAsset(`${work.id}:audio`)
        if (audio) localAudio.value = { ...localAudio.value, [work.id]: true }
      } catch {
        /* 单个素材读取失败不影响整个工作区 */
      }
    }
  }

  /** 首次进入后台时加载草稿；没有草稿就从源码数据起步 */
  async function init(): Promise<void> {
    if (hydrated.value) return
    loading.value = true
    try {
      const snapshot = readAdminSnapshot()
      works.value = snapshot ? snapshot.works : clone(DREAM_WORKS)
      site.value = snapshot ? snapshot.site : { ...DREAM_SITE }
      savedAt.value = snapshot?.updatedAt ?? 0
      await loadAssets()
    } finally {
      hydrated.value = true
      loading.value = false
    }
  }

  /* ---------------- 素材迁移 ---------------- */

  async function moveAssets(fromId: string, toId: string): Promise<void> {
    if (fromId === toId) return

    for (const kind of ['cover', 'audio'] as const) {
      const blob = await getAsset(`${fromId}:${kind}`).catch(() => null)
      if (!blob) continue
      await putAsset(`${toId}:${kind}`, blob).catch(() => undefined)
      await deleteAsset(`${fromId}:${kind}`).catch(() => undefined)
    }

    const previews = { ...coverPreviews.value }
    const preview = previews[`${fromId}:cover`]
    if (preview) {
      previews[`${toId}:cover`] = preview
      delete previews[`${fromId}:cover`]
      coverPreviews.value = previews
    }

    if (localCover.value[fromId]) {
      const next = { ...localCover.value, [toId]: true }
      delete next[fromId]
      localCover.value = next
    }
    if (localAudio.value[fromId]) {
      const next = { ...localAudio.value, [toId]: true }
      delete next[fromId]
      localAudio.value = next
    }
  }

  /* ---------------- 作品增删改 ---------------- */

  async function saveWork({
    originalId,
    work,
    coverFile,
    audioFile,
    clearCover,
    clearAudio,
  }: SaveWorkPayload): Promise<void> {
    const next: DreamWork = { ...work }

    if (originalId && originalId !== next.id) {
      await moveAssets(originalId, next.id)
    }

    if (clearCover && !coverFile) {
      await deleteAsset(`${next.id}:cover`).catch(() => undefined)
      const preview = coverPreviews.value[`${next.id}:cover`]
      if (preview) URL.revokeObjectURL(preview)
      const previews = { ...coverPreviews.value }
      delete previews[`${next.id}:cover`]
      coverPreviews.value = previews
      const covers = { ...localCover.value }
      delete covers[next.id]
      localCover.value = covers
      next.cover = undefined
    }

    if (clearAudio && !audioFile) {
      await deleteAsset(`${next.id}:audio`).catch(() => undefined)
      const audios = { ...localAudio.value }
      delete audios[next.id]
      localAudio.value = audios
      next.audioUrl = undefined
    }

    if (coverFile) {
      const blob = await compressImage(coverFile)
      await putAsset(`${next.id}:cover`, blob)
      const previous = coverPreviews.value[`${next.id}:cover`]
      if (previous) URL.revokeObjectURL(previous)
      coverPreviews.value = {
        ...coverPreviews.value,
        [`${next.id}:cover`]: URL.createObjectURL(blob),
      }
      localCover.value = { ...localCover.value, [next.id]: true }
      next.cover = `${next.id}.webp`
    }

    if (audioFile) {
      await putAsset(`${next.id}:audio`, audioFile)
      localAudio.value = { ...localAudio.value, [next.id]: true }
      next.audioUrl = `${next.id}.${extensionOf(audioFile)}`
    }

    const index = originalId ? works.value.findIndex((item) => item.id === originalId) : -1
    if (index >= 0) works.value.splice(index, 1, next)
    else works.value.unshift(next)

    persist()
  }

  async function removeWork(id: string): Promise<void> {
    await deleteAsset(`${id}:cover`).catch(() => undefined)
    await deleteAsset(`${id}:audio`).catch(() => undefined)

    const preview = coverPreviews.value[`${id}:cover`]
    if (preview) URL.revokeObjectURL(preview)

    const previews = { ...coverPreviews.value }
    delete previews[`${id}:cover`]
    coverPreviews.value = previews

    const covers = { ...localCover.value }
    delete covers[id]
    localCover.value = covers

    const audios = { ...localAudio.value }
    delete audios[id]
    localAudio.value = audios

    works.value = works.value.filter((work) => work.id !== id)
    persist()
  }

  function setSite(next: DreamSiteConfig): void {
    site.value = { ...next }
    persist()
  }

  /** 放弃本机草稿，重新读取源码里的作品与参数（会清空已上传素材） */
  async function resetFromSource(): Promise<void> {
    await clearAssets().catch(() => undefined)
    for (const url of Object.values(coverPreviews.value)) URL.revokeObjectURL(url)
    coverPreviews.value = {}
    localCover.value = {}
    localAudio.value = {}
    works.value = clone(DREAM_WORKS)
    site.value = { ...DREAM_SITE }
    persist()
  }

  /** 按分类生成一个不冲突的 id */
  function suggestId(category: DreamCategoryKey): string {
    const ids = new Set(works.value.map((work) => work.id))
    let index = 1
    while (ids.has(`${category}-${String(index).padStart(2, '0')}`)) index += 1
    return `${category}-${String(index).padStart(2, '0')}`
  }

  return {
    works,
    site,
    hydrated,
    loading,
    savedAt,
    storageError,
    totalVotes,
    covered,
    missingCover,
    categoryCounts,
    coverUrl,
    hasLocalCover,
    hasLocalAudio,
    init,
    saveWork,
    removeWork,
    setSite,
    resetFromSource,
    suggestId,
  }
})
