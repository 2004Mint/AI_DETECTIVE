<script setup lang="ts">
/**
 * 后台 · 作品编辑抽屉
 *
 * 右侧抽屉表单：基本信息 / 封面 / 文案 / 音频。
 * 图片与音频先在本机暂存，保存后才写入 IndexedDB，取消不会留下垃圾。
 */
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { ImagePlus, Music, Upload, X } from 'lucide-vue-next'
import { DREAM_CATEGORIES } from '@/data/dream/categories'
import type { DreamWork } from '@/types/dream'

const props = defineProps<{
  /** null 表示新增 */
  work: DreamWork | null
  /** 新增时的建议 id */
  suggestedId: string
  /** 已存在的 id（含当前作品，会排除自身） */
  existingIds: string[]
  /** 已有封面地址（仓库里的或本机 blob） */
  coverUrl: string
  /** 已有音频文件名 */
  audioName: string
}>()

const emit = defineEmits<{
  close: []
  submit: [
    {
      work: DreamWork
      coverFile: File | null
      audioFile: File | null
      clearCover: boolean
      clearAudio: boolean
    },
  ]
}>()

const isNew = props.work === null

const draft = reactive<DreamWork>(
  props.work
    ? { ...props.work }
    : {
        id: props.suggestedId,
        title: '',
        category: 'visual',
        voteCount: 0,
        createdAt: new Date().toISOString(),
      },
)

/* ---------------- 时间字段 ---------------- */

function toInputValue(iso: string | undefined): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const createdAtInput = ref(toInputValue(draft.createdAt))

function onCreatedAtChange(value: string): void {
  createdAtInput.value = value
  if (!value) {
    draft.createdAt = undefined
    return
  }
  const date = new Date(value)
  draft.createdAt = Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function onCreatedAtInput(event: Event): void {
  onCreatedAtChange((event.target as HTMLInputElement).value)
}

/* ---------------- 校验 ---------------- */

const idError = computed(() => {
  const id = draft.id.trim()
  if (!id) return '必填，会出现在作品链接里'
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(id)) return '只能用英文、数字和短横线'
  const others = props.existingIds.filter((item) => item !== props.work?.id)
  if (others.includes(id)) return '这个 id 已被其他作品占用'
  return ''
})

const titleError = computed(() => (draft.title.trim() ? '' : '必填'))

const canSubmit = computed(() => !idError.value && !titleError.value)

/* ---------------- 封面 ---------------- */

const coverFile = ref<File | null>(null)
const coverPreview = ref('')
const clearCover = ref(false)
const dragging = ref(false)
const coverError = ref('')

const coverDisplay = computed(() => {
  if (coverFile.value) return coverPreview.value
  return clearCover.value ? '' : props.coverUrl
})

function pickCover(file: File): void {
  if (!file.type.startsWith('image/')) {
    coverError.value = '请选择图片文件（jpg / png / webp）'
    return
  }
  coverError.value = ''
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverPreview.value = URL.createObjectURL(file)
  coverFile.value = file
  clearCover.value = false
}

function onCoverInput(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) pickCover(file)
  ;(event.target as HTMLInputElement).value = ''
}

function removeCover(): void {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
  coverPreview.value = ''
  coverFile.value = null
  clearCover.value = true
}

function onDrop(event: DragEvent): void {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) pickCover(file)
}

/* ---------------- 音频 ---------------- */

const audioFile = ref<File | null>(null)
const clearAudio = ref(false)
const audioError = ref('')

const audioDisplay = computed(() => {
  if (audioFile.value) return audioFile.value.name
  return clearAudio.value ? '' : props.audioName
})

function onAudioInput(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('audio/')) {
    audioError.value = '请选择音频文件（mp3 / m4a / wav）'
    return
  }
  audioError.value = ''
  audioFile.value = file
  clearAudio.value = false
}

function removeAudio(): void {
  audioFile.value = null
  clearAudio.value = true
}

/* ---------------- 提交 ---------------- */

function submit(): void {
  if (!canSubmit.value) return
  emit('submit', {
    work: {
      ...draft,
      id: draft.id.trim(),
      title: draft.title.trim(),
      description: draft.description?.trim() || undefined,
      prompt: draft.prompt?.trim() || undefined,
      tool: draft.tool?.trim() || undefined,
      creator: draft.creator?.trim() || undefined,
      body: draft.body?.trim() || undefined,
    },
    coverFile: coverFile.value,
    audioFile: audioFile.value,
    clearCover: clearCover.value && !coverFile.value,
    clearAudio: clearAudio.value && !audioFile.value,
  })
}

onBeforeUnmount(() => {
  if (coverPreview.value) URL.revokeObjectURL(coverPreview.value)
})
</script>

<template>
  <div class="admin-overlay" @click="emit('close')" />
  <aside class="admin-drawer" role="dialog" aria-modal="true">
    <header class="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-6">
      <div>
        <h2 class="text-[15px] font-semibold text-slate-900">{{ isNew ? '新增作品' : '编辑作品' }}</h2>
        <p class="mt-0.5 font-mono text-[11px] text-slate-400">{{ draft.id || '未设置 id' }}</p>
      </div>
      <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" aria-label="关闭" @click="emit('close')">
        <X :size="14" aria-hidden="true" />
      </button>
    </header>

    <div class="admin-drawer-body">
      <!-- 基本信息 -->
      <section>
        <h3 class="mb-3 text-[12px] font-semibold tracking-wide text-slate-400">基本信息</h3>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label" for="work-id">作品 ID</label>
            <input
              id="work-id"
              v-model="draft.id"
              class="admin-input font-mono"
              placeholder="visual-01"
            />
            <p v-if="idError" class="admin-hint !text-red-500">{{ idError }}</p>
            <p v-else class="admin-hint">链接地址：/dream-studio/work/{{ draft.id || '…' }}</p>
          </div>

          <div>
            <label class="admin-label" for="work-category">分类</label>
            <select id="work-category" v-model="draft.category" class="admin-select">
              <option v-for="item in DREAM_CATEGORIES" :key="item.key" :value="item.key">
                {{ item.label }}
              </option>
            </select>
            <p class="admin-hint">决定首页筛选与详情页标签</p>
          </div>
        </div>

        <div class="mt-4">
          <label class="admin-label" for="work-title">标题</label>
          <input id="work-title" v-model="draft.title" class="admin-input" placeholder="例如：会发光的鲸鱼穿过云层" />
          <p v-if="titleError" class="admin-hint !text-red-500">{{ titleError }}</p>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label" for="work-tool">AI 工具</label>
            <input id="work-tool" v-model="draft.tool" class="admin-input" placeholder="Midjourney v6" />
          </div>
          <div>
            <label class="admin-label" for="work-creator">创作者</label>
            <input id="work-creator" v-model="draft.creator" class="admin-input" placeholder="留空显示「匿名社员」" />
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label class="admin-label" for="work-votes">初始票数</label>
            <input id="work-votes" v-model.number="draft.voteCount" type="number" min="0" class="admin-input" />
          </div>
          <div>
            <label class="admin-label" for="work-created">创作时间</label>
            <input
              id="work-created"
              :value="createdAtInput"
              type="datetime-local"
              class="admin-input"
              @input="onCreatedAtInput"
            />
          </div>
        </div>
      </section>

      <!-- 封面 -->
      <section class="mt-6 border-t border-slate-100 pt-5">
        <h3 class="mb-3 text-[12px] font-semibold tracking-wide text-slate-400">封面图片</h3>

        <div
          class="admin-drop"
          :class="dragging ? 'is-dragging' : ''"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="onDrop"
        >
          <div class="admin-thumb">
            <img v-if="coverDisplay" :src="coverDisplay" alt="封面预览" />
            <div v-else class="grid h-full w-full place-items-center text-slate-400">
              <ImagePlus :size="22" aria-hidden="true" />
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-[12px] font-medium text-slate-700">
              {{ coverDisplay ? '已选择图片' : '拖拽图片到这里，或点击选择' }}
            </p>
            <p class="mt-0.5 text-[11px] text-slate-400">
              会自动压缩为 WebP（最长边 1600px），保存后生成
              <span class="font-mono">{{ draft.id || '作品ID' }}.webp</span>
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <label class="admin-btn admin-btn-ghost admin-btn-sm cursor-pointer">
                <Upload :size="13" aria-hidden="true" />
                选择图片
                <input type="file" accept="image/*" class="hidden" @change="onCoverInput" />
              </label>
              <button v-if="coverDisplay" type="button" class="admin-btn admin-btn-danger admin-btn-sm" @click="removeCover">
                移除
              </button>
            </div>
            <p v-if="coverError" class="admin-hint !text-red-500">{{ coverError }}</p>
          </div>
        </div>
      </section>

      <!-- 文案 -->
      <section class="mt-6 border-t border-slate-100 pt-5">
        <h3 class="mb-3 text-[12px] font-semibold tracking-wide text-slate-400">文案</h3>

        <div>
          <label class="admin-label" for="work-desc">创作简介</label>
          <textarea
            id="work-desc"
            v-model="draft.description"
            class="admin-textarea"
            rows="3"
            placeholder="一两句话说清这件作品在讲什么"
          />
        </div>

        <div class="mt-4">
          <label class="admin-label" for="work-prompt">创作提示词（Prompt）</label>
          <textarea
            id="work-prompt"
            v-model="draft.prompt"
            class="admin-textarea"
            rows="4"
            placeholder="完整的提示词，详情页可一键复制"
          />
        </div>

        <div v-if="draft.category === 'text'" class="mt-4">
          <label class="admin-label" for="work-body">作品正文</label>
          <textarea
            id="work-body"
            v-model="draft.body"
            class="admin-textarea"
            rows="7"
            placeholder="短诗 / 故事 / 文案正文，换行会保留"
          />
        </div>
      </section>

      <!-- 音频 -->
      <section v-if="draft.category === 'music'" class="mt-6 border-t border-slate-100 pt-5">
        <h3 class="mb-3 text-[12px] font-semibold tracking-wide text-slate-400">音乐试听</h3>

        <div class="admin-drop">
          <div class="admin-thumb grid place-items-center">
            <Music :size="22" class="text-slate-400" aria-hidden="true" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[12px] font-medium text-slate-700">
              {{ audioDisplay || '还没有上传音频' }}
            </p>
            <p class="mt-0.5 text-[11px] text-slate-400">
              建议 mp3 / m4a，≤ 3MB；留空时详情页显示「音频正在上传中」
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              <label class="admin-btn admin-btn-ghost admin-btn-sm cursor-pointer">
                <Upload :size="13" aria-hidden="true" />
                选择音频
                <input type="file" accept="audio/*" class="hidden" @change="onAudioInput" />
              </label>
              <button v-if="audioDisplay" type="button" class="admin-btn admin-btn-danger admin-btn-sm" @click="removeAudio">
                移除
              </button>
            </div>
            <p v-if="audioError" class="admin-hint !text-red-500">{{ audioError }}</p>
          </div>
        </div>
      </section>
    </div>

    <footer class="admin-drawer-footer">
      <button type="button" class="admin-btn admin-btn-ghost" @click="emit('close')">取消</button>
      <button type="button" class="admin-btn admin-btn-primary" :disabled="!canSubmit" @click="submit">
        保存
      </button>
    </footer>
  </aside>
</template>
