/**
 * AI 人格研究所 · 五道题
 *
 * 出题原则：
 * 1. 全部是大学生每天真的会遇到的场景，不出现「焦虑」「内向」「认知」这类测评词；
 * 2. 四个选项分别指向不同的性格，没有「正确答案」，怎么选都像是在夸自己；
 * 3. 主性格 +2 分、副性格 +1 分，让结果有主次而不是平均分。
 */
import type { QuizQuestion } from '@/types/personality'

export const PERSONALITY_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q1',
    index: 1,
    kicker: 'A FREE DAY',
    title: '周末突然空出一整天，完全没人管你，你会：',
    options: [
      {
        id: 'A',
        label: '背上包出门乱走，走到哪儿算哪儿',
        scores: { explorer: 2, creator: 1 },
      },
      {
        id: 'B',
        label: '把攒了很久的剧、游戏或书清一清',
        scores: { dreamer: 2, creator: 1 },
      },
      {
        id: 'C',
        label: '立刻约人，人多才有点意思',
        scores: { host: 2, healer: 1 },
      },
      {
        id: 'D',
        label: '列出一直没做完的事，一件件干掉',
        scores: { doer: 2, observer: 1 },
      },
    ],
  },
  {
    id: 'q2',
    index: 2,
    kicker: 'NEW WORLD',
    title: '如果某天醒来，你站在一个全新的世界里，你最想先做的是：',
    options: [
      {
        id: 'A',
        label: '先搞清楚这地方的规则和边界',
        scores: { observer: 2, explorer: 1 },
      },
      {
        id: 'B',
        label: '找个最高点，看看这个世界长什么样',
        scores: { creator: 2, explorer: 1 },
      },
      {
        id: 'C',
        label: '找个人聊聊，问问这儿的人都怎么生活',
        scores: { healer: 2, host: 1 },
      },
      {
        id: 'D',
        label: '什么都别想，先玩起来再说',
        scores: { player: 2, explorer: 1 },
      },
    ],
  },
  {
    id: 'q3',
    index: 3,
    kicker: '2 A.M. MESSAGE',
    title: '朋友半夜发来一句「我有点难受」，你会：',
    options: [
      {
        id: 'A',
        label: '先听他说完，再问要不要出来走走',
        scores: { healer: 2, dreamer: 1 },
      },
      {
        id: 'B',
        label: '直接打电话过去，边聊边帮他想办法',
        scores: { doer: 2, host: 1 },
      },
      {
        id: 'C',
        label: '先甩一堆沙雕表情包，把人逗笑为止',
        scores: { player: 2, host: 1 },
      },
      {
        id: 'D',
        label: '帮他把事情捋一遍，到底发生了什么',
        scores: { observer: 2, healer: 1 },
      },
    ],
  },
  {
    id: 'q4',
    index: 4,
    kicker: 'ONE POWER',
    title: '如果能拿到一种超能力（只能选一个），你要：',
    options: [
      {
        id: 'A',
        label: '时间暂停，想多待一会儿就多待一会儿',
        scores: { dreamer: 2, explorer: 1 },
      },
      {
        id: 'B',
        label: '瞬间移动，任何地方想去就去',
        scores: { explorer: 2, player: 1 },
      },
      {
        id: 'C',
        label: '读懂别人心里的想法',
        scores: { healer: 2, observer: 1 },
      },
      {
        id: 'D',
        label: '把脑子里想的东西立刻变成真的',
        scores: { creator: 2, doer: 1 },
      },
    ],
  },
  {
    id: 'q5',
    index: 5,
    kicker: 'UNKNOWN TASK',
    title: '老师突然丢给你一个完全没做过的任务，你的第一反应：',
    options: [
      {
        id: 'A',
        label: '先搜资料，搞清楚它到底是个什么东西',
        scores: { observer: 2, doer: 1 },
      },
      {
        id: 'B',
        label: '直接上手试，边做边改',
        scores: { doer: 2, player: 1 },
      },
      {
        id: 'C',
        label: '先想想有没有更好玩的做法',
        scores: { creator: 2, player: 1 },
      },
      {
        id: 'D',
        label: '先找人组队，一个人搞太没意思',
        scores: { host: 2, healer: 1 },
      },
    ],
  },
]

/** 题目数量（进度条与路由守卫都用它） */
export const QUESTION_COUNT = PERSONALITY_QUESTIONS.length

