<script setup lang="ts">
/**
 * 后台 · 站点参数
 *
 * 改的是真正显示在页面上的四段文字；保存只写本机草稿，
 * 需要「导出发布」把 site.ts 覆盖回仓库。
 */
import { reactive, ref } from 'vue'
import { Check } from 'lucide-vue-next'
import { DREAM_SITE } from '@/data/dream/site'
import { useAdminStore } from '@/stores/admin'
import type { DreamSiteConfig } from '@/types/dream'

const store = useAdminStore()
const draft = reactive<DreamSiteConfig>({ ...store.site })
const saved = ref(false)

function save(): void {
  store.setSite({ ...draft })
  saved.value = true
  window.setTimeout(() => {
    saved.value = false
  }, 2000)
}

function restoreSource(): void {
  Object.assign(draft, DREAM_SITE)
}
</script>

<template>
  <div class="max-w-[720px]">
    <div class="admin-card p-6">
      <h2 class="text-[15px] font-semibold text-slate-900">站点参数</h2>
      <p class="mt-1 text-[12px] leading-5 text-slate-500">
        这几项会直接显示在造梦事务所页面上。改完到「导出发布」下载
        <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">site.ts</code>
        覆盖 <code class="rounded bg-slate-100 px-1 py-0.5 text-[11px]">src/data/dream/site.ts</code>。
      </p>

      <div class="mt-5 grid gap-4">
        <div>
          <label class="admin-label" for="site-title">首页标题</label>
          <input id="site-title" v-model="draft.title" class="admin-input" />
          <p class="admin-hint">同时用于顶部品牌名</p>
        </div>

        <div>
          <label class="admin-label" for="site-subtitle">首页副标题</label>
          <input id="site-subtitle" v-model="draft.subtitle" class="admin-input" />
        </div>

        <div>
          <label class="admin-label" for="site-org">页脚社团署名</label>
          <input id="site-org" v-model="draft.footerOrg" class="admin-input" />
        </div>

        <div>
          <label class="admin-label" for="site-note">页脚补充说明</label>
          <input id="site-note" v-model="draft.footerNote" class="admin-input" />
          <p class="admin-hint">建议保留「投票仅保存在本机浏览器」这类说明</p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" class="admin-btn admin-btn-primary" @click="save">保存参数</button>
        <button type="button" class="admin-btn admin-btn-ghost" @click="restoreSource">恢复源码默认值</button>
        <span v-if="saved" class="flex items-center gap-1 text-[12px] text-emerald-600">
          <Check :size="13" aria-hidden="true" />
          已保存到本机
        </span>
      </div>
    </div>
  </div>
</template>
