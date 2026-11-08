<script setup lang="ts">
/**
 * AI 造梦事务所 · 内容管理后台
 *
 * 纯前端（没有服务端）：作品草稿存本机浏览器，导出成 works.ts / site.ts /
 * 素材 ZIP 之后，覆盖到仓库里才算真正发布。
 *
 * 桌面优先：左侧导航 + 顶栏 + 内容区，窄屏会出现横向滚动（后台只在电脑上用）。
 */
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BookOpen,
  Download,
  Images,
  LayoutGrid,
  Plus,
  Search,
  Settings2,
} from 'lucide-vue-next'
import MascotPet from '@/components/MascotPet.vue'
import AdminWorkTable from '@/components/admin/AdminWorkTable.vue'
import WorkEditor from '@/components/admin/WorkEditor.vue'
import AdminSiteSettings from '@/components/admin/AdminSiteSettings.vue'
import AdminExportPanel from '@/components/admin/AdminExportPanel.vue'
import { DREAM_CATEGORIES } from '@/data/dream/categories'
import { useAdminStore } from '@/stores/admin'
import type { DreamCategoryKey, DreamWork } from '@/types/dream'
import '@/assets/admin.css'

type TabKey = 'works' | 'site' | 'export' | 'help'

const NAV: ReadonlyArray<{ key: TabKey; label: string; icon: typeof LayoutGrid }> = [
  { key: 'works', label: '作品管理', icon: LayoutGrid },
  { key: 'site', label: '站点参数', icon: Settings2 },
  { key: 'export', label: '导出发布', icon: Download },
  { key: 'help', label: '使用说明', icon: BookOpen },
]

const PAGE_TITLES: Record<TabKey, string> = {
  works: '作品管理',
  site: '站点参数',
  export: '导出发布',
  help: '使用说明',
}

const store = useAdminStore()
const tab = ref<TabKey>('works')

const keyword = ref('')
const categoryFilter = ref<DreamCategoryKey | 'all'>('all')

const editorOpen = ref(false)
const editing = ref<DreamWork | null>(null)

onMounted(() => {
  void store.init()
})

const filtered = computed(() => {
  const term = keyword.value.trim().toLowerCase()
  return store.works.filter((work) => {
    if (categoryFilter.value !== 'all' && work.category !== categoryFilter.value) return false
    if (!term) return true
    return (
      work.title.toLowerCase().includes(term) ||
      work.id.toLowerCase().includes(term) ||
      (work.tool ?? '').toLowerCase().includes(term) ||
      (work.creator ?? '').toLowerCase().includes(term)
    )
  })
})

const savedLabel = computed(() => {
  if (store.storageError) return '浏览器存储不可用'
  if (!store.savedAt) return '尚未保存'
  const time = new Date(store.savedAt).toLocaleTimeString('zh-CN', { hour12: false })
  return `已保存到本机 ${time}`
})

const suggestedId = computed(() =>
  store.suggestId(categoryFilter.value === 'all' ? 'visual' : categoryFilter.value),
)

const editingCoverUrl = computed(() => (editing.value ? store.coverUrl(editing.value) : ''))

function openCreate(): void {
  editing.value = null
  editorOpen.value = true
}

function openEdit(work: DreamWork): void {
  editing.value = work
  editorOpen.value = true
}

function closeEditor(): void {
  editorOpen.value = false
  editing.value = null
}

async function handleSubmit(payload: {
  work: DreamWork
  coverFile: File | null
  audioFile: File | null
  clearCover: boolean
  clearAudio: boolean
}): Promise<void> {
  await store.saveWork({
    originalId: editing.value?.id ?? null,
    work: payload.work,
    coverFile: payload.coverFile,
    audioFile: payload.audioFile,
    clearCover: payload.clearCover,
    clearAudio: payload.clearAudio,
  })
  closeEditor()
}

function resetFilters(): void {
  keyword.value = ''
  categoryFilter.value = 'all'
}
</script>

<template>
  <div class="admin-root">
    <!-- 左侧导航 -->
    <aside class="admin-sidebar">
      <div class="admin-sidebar-brand">
        <MascotPet :size="32" />
        <div class="min-w-0">
          <p class="truncate text-[13px] font-semibold text-white">AI 造梦事务所</p>
          <p class="text-[10px] text-slate-500">内容管理后台</p>
        </div>
      </div>

      <nav class="admin-nav">
        <button
          v-for="item in NAV"
          :key="item.key"
          type="button"
          class="admin-nav-item"
          :class="tab === item.key ? 'is-active' : ''"
          @click="tab = item.key"
        >
          <component :is="item.icon" :size="16" aria-hidden="true" />
          {{ item.label }}
        </button>
      </nav>

      <div class="mt-auto border-t border-white/10 p-3">
        <RouterLink to="/dream-studio" class="admin-nav-item">
          <Images :size="16" aria-hidden="true" />
          查看前台画廊
        </RouterLink>
        <p class="px-3 pt-2 text-[10px] leading-4 text-slate-500">
          草稿只保存在本机浏览器<br />
          导出后才会进入代码库
        </p>
      </div>
    </aside>

    <!-- 主区域 -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="min-w-0">
          <p class="truncate text-[11px] text-slate-400">AI 造梦事务所 / {{ PAGE_TITLES[tab] }}</p>
          <h1 class="text-[15px] font-semibold text-slate-900">{{ PAGE_TITLES[tab] }}</h1>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <span class="text-[11px] text-slate-400">{{ savedLabel }}</span>
          <button type="button" class="admin-btn admin-btn-primary" @click="tab = 'export'">
            <Download :size="14" aria-hidden="true" />
            导出发布
          </button>
        </div>
      </header>

      <main class="admin-content">
        <div v-if="store.loading" class="py-20 text-center text-[13px] text-slate-400">
          正在加载本机草稿…
        </div>

        <template v-else>
          <!-- 作品管理 -->
          <section v-if="tab === 'works'">
            <div class="grid grid-cols-4 gap-3">
              <div class="admin-card p-4">
                <p class="text-[11px] text-slate-400">作品总数</p>
                <p class="mt-1 text-[24px] font-semibold tabular-nums text-slate-900">
                  {{ store.works.length }}
                </p>
              </div>
              <div class="admin-card p-4">
                <p class="text-[11px] text-slate-400">已配图</p>
                <p class="mt-1 text-[24px] font-semibold tabular-nums text-emerald-600">
                  {{ store.covered }}
                </p>
              </div>
              <div class="admin-card p-4">
                <p class="text-[11px] text-slate-400">缺图</p>
                <p class="mt-1 text-[24px] font-semibold tabular-nums" :class="store.missingCover > 0 ? 'text-red-600' : 'text-slate-900'">
                  {{ store.missingCover }}
                </p>
              </div>
              <div class="admin-card p-4">
                <p class="text-[11px] text-slate-400">总票数</p>
                <p class="mt-1 text-[24px] font-semibold tabular-nums text-slate-900">
                  {{ store.totalVotes }}
                </p>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-3">
              <div class="relative min-w-[260px] flex-1">
                <Search
                  :size="15"
                  class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input v-model="keyword" class="admin-input has-icon" placeholder="搜索标题 / ID / 工具 / 创作者" />
              </div>

              <div class="w-[150px] shrink-0">
                <select v-model="categoryFilter" class="admin-select">
                  <option value="all">全部分类</option>
                  <option v-for="item in DREAM_CATEGORIES" :key="item.key" :value="item.key">
                    {{ item.label }}
                  </option>
                </select>
              </div>

              <button type="button" class="admin-btn admin-btn-primary" @click="openCreate">
                <Plus :size="14" aria-hidden="true" />
                新增作品
              </button>
            </div>

            <div class="mt-3">
              <AdminWorkTable
                :works="filtered"
                :keyword="keyword"
                @edit="openEdit"
                @create="openCreate"
                @reset-filters="resetFilters"
              />
            </div>

            <p class="mt-3 text-[11px] text-slate-400">
              共 {{ store.works.length }} 件作品，当前筛选出 {{ filtered.length }} 件。
              图片建议宽度 ≥ 1200px，上传时会自动压成 WebP。
            </p>
          </section>

          <!-- 站点参数 -->
          <section v-else-if="tab === 'site'">
            <AdminSiteSettings />
          </section>

          <!-- 导出发布 -->
          <section v-else-if="tab === 'export'">
            <AdminExportPanel />
          </section>

          <!-- 使用说明 -->
          <section v-else class="max-w-[760px]">
            <div class="admin-card p-6">
              <h2 class="text-[15px] font-semibold text-slate-900">使用说明</h2>
              <ol class="mt-4 space-y-3 text-[13px] leading-6 text-slate-600">
                <li>
                  <b class="text-slate-900">1. 录入作品</b><br />
                  「作品管理 → 新增作品」，填标题、选分类、拖一张图进来。图片会自动压成 WebP；
                  简介 / 提示词可以稍后补。
                </li>
                <li>
                  <b class="text-slate-900">2. 改站点参数</b><br />
                  「站点参数」里改首页标题、副标题、页脚文案。
                </li>
                <li>
                  <b class="text-slate-900">3. 导出发布</b><br />
                  「导出发布」下载 <code class="rounded bg-slate-100 px-1">works.ts</code>、
                  <code class="rounded bg-slate-100 px-1">site.ts</code> 和素材 ZIP，按页面提示覆盖到仓库。
                </li>
                <li>
                  <b class="text-slate-900">4. 自检</b><br />
                  在项目目录运行 <code class="rounded bg-slate-100 px-1">npm run check:dream</code>，
                  确认没有缺图 / 重名 id，再 <code class="rounded bg-slate-100 px-1">npm run dev</code> 预览。
                </li>
              </ol>

              <div class="mt-5 rounded-lg bg-amber-50 px-4 py-3 text-[12px] leading-5 text-amber-800">
                这个后台没有服务端：数据只存在当前浏览器的 localStorage / IndexedDB。
                换电脑、清缓存都会丢，录完请及时导出。
              </div>
            </div>
          </section>
        </template>
      </main>
    </div>

    <!-- 编辑抽屉 -->
    <WorkEditor
      v-if="editorOpen"
      :work="editing"
      :suggested-id="suggestedId"
      :existing-ids="store.works.map((work) => work.id)"
      :cover-url="editingCoverUrl"
      :audio-name="editing?.audioUrl ?? ''"
      @close="closeEditor"
      @submit="handleSubmit"
    />
  </div>
</template>
