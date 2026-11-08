/**
 * 后台 · 本机持久化
 *
 * 作品/参数草稿存 localStorage（体积小），图片与音频 Blob 存 IndexedDB
 * （避免 base64 撑爆 localStorage 的 5MB 配额）。
 *
 * 这里的所有数据都只在当前浏览器里；导出成文件后才进入代码库。
 */
import type { DreamSiteConfig, DreamWork } from '@/types/dream'

export const ADMIN_STORAGE_KEY = 'ai-dream-studio:admin:v1'

const DB_NAME = 'ai-dream-studio-assets'
const STORE_NAME = 'assets'
const DB_VERSION = 1

export interface AdminSnapshot {
  works: DreamWork[]
  site: DreamSiteConfig
  updatedAt: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWork(value: unknown): value is DreamWork {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.category === 'string'
  )
}

function isSite(value: unknown): value is DreamSiteConfig {
  if (!isRecord(value)) return false
  return (
    typeof value.title === 'string' &&
    typeof value.subtitle === 'string' &&
    typeof value.footerOrg === 'string' &&
    typeof value.footerNote === 'string'
  )
}

/** 读取后台草稿；没有或损坏时返回 null */
export function readAdminSnapshot(): AdminSnapshot | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    if (!Array.isArray(parsed.works) || !isSite(parsed.site)) return null
    return {
      works: parsed.works.filter(isWork),
      site: parsed.site,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    }
  } catch {
    return null
  }
}

/** 写入后台草稿（失败时静默，页面会提示存储不可用） */
export function writeAdminSnapshot(snapshot: AdminSnapshot): boolean {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}

export function clearAdminSnapshot(): void {
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY)
  } catch {
    /* 忽略 */
  }
}

/* ---------------- IndexedDB（素材 Blob） ---------------- */

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('无法打开 IndexedDB'))
  })
  return dbPromise
}

function runRequest<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode)
        const request = action(tx.objectStore(STORE_NAME))
        request.onsuccess = () => resolve(request.result as T)
        request.onerror = () => reject(request.error ?? new Error('素材存储操作失败'))
      }),
  )
}

export async function putAsset(key: string, blob: Blob): Promise<void> {
  await runRequest<IDBValidKey>('readwrite', (store) => store.put(blob, key))
}

export async function getAsset(key: string): Promise<Blob | null> {
  const value = await runRequest<Blob | undefined>('readonly', (store) => store.get(key))
  return value ?? null
}

export async function deleteAsset(key: string): Promise<void> {
  await runRequest<undefined>('readwrite', (store) => store.delete(key))
}

export async function clearAssets(): Promise<void> {
  await runRequest<undefined>('readwrite', (store) => store.clear())
}

export async function listAssetKeys(): Promise<string[]> {
  const keys = await runRequest<IDBValidKey[]>('readonly', (store) => store.getAllKeys())
  return keys.map((key) => String(key))
}
