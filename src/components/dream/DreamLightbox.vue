<script setup lang="ts">
/**
 * AI 造梦事务所 · 图片灯箱
 *
 * 作品详情页点封面进入，铺满视口展示完整原图（详情页那里是裁切过的）。
 * 关闭方式：点右上角、点空白处、按 Esc。
 */
import { onBeforeUnmount, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps<{
  visible: boolean
  src: string
  alt?: string
}>()

const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.visible,
  (open) => {
    if (open) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-night-deep/95 p-4 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        :aria-label="alt ?? '查看作品大图'"
        @click.self="emit('close')"
      >
        <img
          :src="src"
          :alt="alt ?? '作品大图'"
          class="max-h-[86dvh] max-w-full rounded-2xl object-contain shadow-2xl ring-1 ring-white/15"
          draggable="false"
        />

        <button
          type="button"
          class="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 active:scale-90"
          aria-label="关闭大图"
          @click="emit('close')"
        >
          <X :size="20" />
        </button>

        <p class="pointer-events-none absolute inset-x-0 bottom-5 text-center text-[11px] text-white/60">
          点空白处或按 Esc 关闭
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
