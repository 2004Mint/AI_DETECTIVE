<script setup lang="ts">
/**
 * AI 造梦事务所 · 返回造梦事务所
 *
 * 作品详情 / 分类页左上角的统一入口，回到造梦事务所首页。
 *
 * 故意用 RouterLink 而不是浏览器后退：按钮上写的是「返回造梦事务所」，
 * 点下去就该到这一页，不该出现「点了却回到分类页/入口页」的错位；
 * 想按历史后退，交给系统手势和浏览器返回键。
 *
 * 样式与顶栏的「‹ 游乐场」同一套玻璃胶囊，hover 时箭头会往左滑一点。
 */
import { RouterLink } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
</script>

<template>
  <RouterLink to="/dream-studio" class="dream-back">
    <ChevronLeft :size="13" class="dream-back-arrow" aria-hidden="true" />
    返回造梦事务所
  </RouterLink>
</template>
