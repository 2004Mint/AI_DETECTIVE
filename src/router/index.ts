/**
 * 路由配置
 * 流程：首页 → 规则 → 游戏(10关) → 结算 → 招新
 * 守卫：游戏页/结算页在刷新后根据 Pinia 中恢复的局状态决定去向。
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'AI 鉴定师 · AI DETECTIVE' },
    },
    {
      path: '/rule',
      name: 'rule',
      component: () => import('@/views/RuleView.vue'),
      meta: { title: '游戏规则 · AI 鉴定师' },
    },
    {
      path: '/game',
      name: 'game',
      component: () => import('@/views/GameView.vue'),
      meta: { title: '挑战中 · AI 鉴定师' },
    },
    {
      path: '/result',
      name: 'result',
      component: () => import('@/views/ResultView.vue'),
      meta: { title: '挑战完成 · AI 鉴定师' },
    },
    {
      path: '/recruit',
      name: 'recruit',
      component: () => import('@/views/RecruitView.vue'),
      meta: { title: 'AI 研习社 · 加入我们' },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'home' } },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const game = useGameStore()
  if (to.name === 'game' && game.status !== 'playing') {
    return { name: game.status === 'finished' ? 'result' : 'home' }
  }
  if (to.name === 'result' && game.status !== 'finished') {
    return { name: 'home' }
  }
  document.title = (to.meta.title as string | undefined) ?? 'AI 鉴定师'
  return true
})

export default router
