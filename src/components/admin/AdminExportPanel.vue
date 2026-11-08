<script setup lang="ts">
/**
 * 后台 · 导出发布
 *
 * 把本机草稿变成可提交的文件：
 * works.ts / site.ts / 素材 ZIP；以及「重新从源码导入」。
 */
import { computed, ref } from 'vue'
import { Archive, Check, Copy, Download, FileCode2, RotateCcw } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import {
  buildAssetZip,
  downloadBlob,
  downloadText,
  serializeSite,
  serializeWorks,
} from '@/utils/adminExport'

const store = useAdminStore()

const copied = ref(false)
const zipping = ref(false)
const zipMessage = ref('')
const confirmReset = ref(false)
const resetDone = ref(false)

const withLocalAssets = computed(
  () => store.works.filter((work) => store.hasLocalCover(work.id) || store.hasLocalAudio(work.id)).length,
)

function downloadWorks(): void {
  downloadText(serializeWorks(store.works), 'works.ts')
}

function downloadSite(): void {
  downloadText(serializeSite(store.site), 'site.ts')
}

async function copyWorks(): Promise<void> {
  try {
    await navigator.clipboard.writeText(serializeWorks(store.works))
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    zipMessage.value = '浏览器不允许写入剪贴板，请改用「下载 works.ts」'
  }
}

async function downloadZip(): Promise<void> {
  zipping.value = true
  zipMessage.value = ''
  try {
    const result = await buildAssetZip(store.works)
    downloadBlob(result.blob, 'dream-assets.zip')
    const missing =
      result.missing.length > 0
        ? `；另有 ${result.missing.length} 个引用的文件已在仓库里，未重复打包`
        : ''
    zipMessage.value = `已打包 ${result.files.length} 个新素材${missing}`
  } catch (error) {
    zipMessage.value = error instanceof Error ? error.message : '打包失败'
  } finally {
    zipping.value = false
  }
}

async function doReset(): Promise<void> {
  await store.resetFromSource()
  confirmReset.value = false
  resetDone.value = true
  window.setTimeout(() => {
    resetDone.value = false
  }, 2500)
}
</script>

<template>
  <div class="max-w-[880px] space-y-4">
    <!-- 代码文件 -->
    <section class="admin-card p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <FileCode2 :size="16" class="text-slate-400" aria-hidden="true" />
            代码文件
          </h2>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            下载后覆盖到
            <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">src/data/dream/</code>
            下的同名文件，提交后线上生效。
          </p>
        </div>
        <span class="admin-tag admin-tag-slate">{{ store.works.length }} 件作品</span>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button type="button" class="admin-btn admin-btn-primary" @click="downloadWorks">
          <Download :size="14" aria-hidden="true" />
          下载 works.ts
        </button>
        <button type="button" class="admin-btn admin-btn-ghost" @click="downloadSite">
          <Download :size="14" aria-hidden="true" />
          下载 site.ts
        </button>
        <button type="button" class="admin-btn admin-btn-ghost" @click="copyWorks">
          <Check v-if="copied" :size="14" aria-hidden="true" />
          <Copy v-else :size="14" aria-hidden="true" />
          {{ copied ? '已复制' : '复制 works.ts 内容' }}
        </button>
      </div>
    </section>

    <!-- 素材包 -->
    <section class="admin-card p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
            <Archive :size="16" class="text-slate-400" aria-hidden="true" />
            新上传素材
          </h2>
          <p class="mt-1 text-[12px] leading-5 text-slate-500">
            只打包在后台新上传的图片和音频。解压后把
            <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">works/</code>
            放进 <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">public/dream/</code>，
            <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">audio/</code> 同理。
          </p>
        </div>
        <span class="admin-tag admin-tag-amber">{{ withLocalAssets }} 件含新素材</span>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" class="admin-btn admin-btn-primary" :disabled="zipping" @click="downloadZip">
          <Download :size="14" aria-hidden="true" />
          {{ zipping ? '正在打包…' : '下载素材 ZIP' }}
        </button>
        <span v-if="zipMessage" class="text-[11px] text-slate-500">{{ zipMessage }}</span>
      </div>
    </section>

    <!-- 重新开始 -->
    <section class="admin-card border-red-100 p-6">
      <h2 class="flex items-center gap-2 text-[15px] font-semibold text-slate-900">
        <RotateCcw :size="16" class="text-slate-400" aria-hidden="true" />
        重新从源码导入
      </h2>
      <p class="mt-1 text-[12px] leading-5 text-slate-500">
        放弃本机草稿，重新读取 <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">works.ts</code> 与
        <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">site.ts</code>。
        <b class="text-red-600">已上传但未导出的图片 / 音频会一并清空。</b>
      </p>

      <div class="mt-4 flex flex-wrap items-center gap-2">
        <template v-if="!confirmReset">
          <button type="button" class="admin-btn admin-btn-danger" @click="confirmReset = true">
            重新导入
          </button>
        </template>
        <template v-else>
          <button type="button" class="admin-btn admin-btn-danger" @click="doReset">确认清空并重新导入</button>
          <button type="button" class="admin-btn admin-btn-ghost" @click="confirmReset = false">取消</button>
        </template>
        <span v-if="resetDone" class="flex items-center gap-1 text-[12px] text-emerald-600">
          <Check :size="13" aria-hidden="true" />
          已重新导入
        </span>
      </div>
    </section>
  </div>
</template>
