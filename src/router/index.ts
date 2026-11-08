/**
 * 路由配置
 * 入口：/ 游乐场总入口（AI 鉴定师 / AI 造梦事务所 / 后续板块）
 * 游戏：/detective → 规则 → 游戏(3关) → 结算 → 招新
 * 展览：/dream-studio 下的四个页面（首页 / 分类 / 作品详情 / 人气榜）
 * 守卫：游戏页/结算页在刷新后根据 Pinia 中恢复的局状态决定去向。
 */
import { createRouter, createWebHistory } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePersonalityStore } from '@/stores/personality'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/PortalView.vue'),
      meta: { title: 'AI 灵感游乐场 · 校园文化节' },
    },
    {
      path: '/detective',
      name: 'detective',
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

    /* ---------------- AI 人格研究所（独立子项目） ---------------- */
    {
      path: '/personality',
      name: 'personality-home',
      component: () => import('@/views/personality/PersonalityHomeView.vue'),
      meta: { title: 'AI 人格研究所 · 5 道题发现隐藏人格' },
    },
    {
      path: '/personality/quiz',
      name: 'personality-quiz',
      component: () => import('@/views/personality/PersonalityQuizView.vue'),
      meta: { title: '答题中 · AI 人格研究所' },
    },
    {
      path: '/personality/result',
      name: 'personality-result',
      component: () => import('@/views/personality/PersonalityResultView.vue'),
      meta: { title: '我的人格档案 · AI 人格研究所' },
    },

    /* ---------------- AI 造梦事务所（独立子项目） ---------------- */
    {
      path: '/dream-studio',
      name: 'dream-home',
      component: () => import('@/views/dream/DreamHomeView.vue'),
      meta: { title: 'AI 造梦事务所 · AI Dream Studio' },
    },
    {
      path: '/dream-studio/category/:category',
      name: 'dream-category',
      component: () => import('@/views/dream/DreamCategoryView.vue'),
      meta: { title: '作品分类 · AI 造梦事务所' },
    },
    {
      path: '/dream-studio/work/:id',
      name: 'dream-work',
      component: () => import('@/views/dream/DreamWorkView.vue'),
      meta: { title: '作品详情 · AI 造梦事务所' },
    },
    {
      path: '/dream-studio/ranking',
      name: 'dream-ranking',
      component: () => import('@/views/dream/DreamRankingView.vue'),
      meta: { title: '人气榜 · AI 造梦事务所' },
    },

    /* ---------------- 内容管理后台（纯本机，不连服务器） ---------------- */
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { title: '内容管理后台 · AI 造梦事务所' },
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
    return { name: game.status === 'finished' ? 'result' : 'detective' }
  }
  if (to.name === 'result' && game.status !== 'finished') {
    return { name: 'detective' }
  }

  // 人格研究所：没答完就进结果页会被送回答题页（答案存在本机，刷新也能接着答）
  if (to.name === 'personality-quiz' || to.name === 'personality-result') {
    const personality = usePersonalityStore()
    personality.hydrate()
    if (to.name === 'personality-result' && !personality.complete) {
      return { name: 'personality-quiz' }
    }
  }

  document.title = (to.meta.title as string | undefined) ?? 'AI 灵感游乐场'
  return true
})

export default router
