<script setup lang="ts">
/**
 * 后台 · 作品表格
 *
 * 传统后台表格：封面 / 标题 / 分类 / 工具 / 票数 / 状态 / 操作。
 * 删除是行内二次确认，避免误删。
 */
import { ref } from 'vue'
import { ImageOff, Pencil, Trash2 } from 'lucide-vue-next'
import { dreamCategoryOf } from '@/data/dream/categories'
import { useAdminStore } from '@/stores/admin'
import type { DreamWork } from '@/types/dream'

defineProps<{
  works: readonly DreamWork[]
  keyword: string
}>()

const emit = defineEmits<{
  edit: [work: DreamWork]
  create: []
  resetFilters: []
}>()

const store = useAdminStore()
const pendingDelete = ref<string | null>(null)

function categoryLabel(key: string): string {
  return dreamCategoryOf(key)?.short ?? '未分类'
}

async function confirmDelete(id: string): Promise<void> {
  await store.removeWork(id)
  pendingDelete.value = null
}
</script>

<template>
  <div class="admin-card overflow-x-auto">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="w-[72px]">封面</th>
          <th>作品</th>
          <th class="w-[96px]">分类</th>
          <th class="w-[130px]">AI 工具</th>
          <th class="w-[64px]">票数</th>
          <th class="w-[110px]">状态</th>
          <th class="w-[152px] text-right">操作</th>
        </tr>
      </thead>

      <tbody v-if="works.length > 0">
        <tr v-for="work in works" :key="work.id">
          <td>
            <div class="admin-thumb">
              <img v-if="store.coverUrl(work)" :src="store.coverUrl(work)" :alt="work.title" />
              <div v-else class="grid h-full w-full place-items-center text-slate-400">
                <ImageOff :size="18" aria-hidden="true" />
              </div>
            </div>
          </td>

          <td>
            <p class="font-semibold text-slate-900">{{ work.title || '（未命名）' }}</p>
            <p class="mt-0.5 font-mono text-[11px] text-slate-400">{{ work.id }}</p>
          </td>

          <td>
            <span class="admin-tag admin-tag-slate">{{ categoryLabel(work.category) }}</span>
          </td>

          <td class="text-slate-600">{{ work.tool || '—' }}</td>

          <td class="font-semibold tabular-nums text-slate-700">{{ work.voteCount ?? 0 }}</td>

          <td>
            <span v-if="store.hasLocalCover(work.id)" class="admin-tag admin-tag-amber">新图待导出</span>
            <span v-else-if="work.cover" class="admin-tag admin-tag-green">已配图</span>
            <span v-else class="admin-tag admin-tag-red">缺图</span>
          </td>

          <td>
            <div v-if="pendingDelete === work.id" class="flex items-center justify-end gap-1.5">
              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" @click="confirmDelete(work.id)">
                确认删除
              </button>
              <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" @click="pendingDelete = null">
                取消
              </button>
            </div>
            <div v-else class="flex items-center justify-end gap-1.5">
              <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" @click="emit('edit', work)">
                <Pencil :size="13" aria-hidden="true" />
                编辑
              </button>
              <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" @click="pendingDelete = work.id">
                <Trash2 :size="13" aria-hidden="true" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td colspan="7">
            <div class="flex flex-col items-center gap-3 py-14 text-center">
              <p class="text-[13px] font-semibold text-slate-600">
                {{ keyword ? '没有匹配的作品' : '还没有作品' }}
              </p>
              <p class="text-[12px] text-slate-400">
                {{ keyword ? '换个关键词，或者清空搜索。' : '点「新增作品」开始录入，图片和提示词都可以稍后补。' }}
              </p>
              <button
                v-if="keyword"
                type="button"
                class="admin-btn admin-btn-ghost"
                @click="emit('resetFilters')"
              >
                清空筛选
              </button>
              <button v-else type="button" class="admin-btn admin-btn-primary" @click="emit('create')">
                新增作品
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
