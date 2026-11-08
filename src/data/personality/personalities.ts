/**
 * AI 人格研究所 · 八种人格
 *
 * 文案要求：每人一套自己的说法，不要出现「你是一个热爱生活的人」这种套话。
 * 主题色只用低饱和的暖色 / 柔和彩色，避免赛博蓝紫霓虹。
 */
import type { Personality, PersonalityKey } from '@/types/personality'

export const PERSONALITIES: readonly Personality[] = [
  {
    key: 'creator',
    code: 'TYPE-01',
    name: '灵感爆发型创作者',
    en: 'CREATOR',
    accent: '#ff8a1c',
    keywords: ['脑洞常开', '灵感驱动', '想法过剩'],
    declaration: '你的脑洞没有边界，只有下一次更新。',
    description:
      '别人看到的是一杯奶茶，你看到的是一个可以开店的宇宙。你脑子里同时开着七个项目，进度条都停在 12%。你不是不专注，你是舍不得放下任何一个念头。',
    traits: [
      '想到就兴奋，兴奋完先放一放',
      '收藏夹里全是「以后一定要做」',
      '讲起想法眼睛发亮，讲完发现没人听懂',
    ],
    quote: '「不是我想得太多，是这个世界的可能性太少。」',
  },
  {
    key: 'observer',
    code: 'TYPE-02',
    name: '冷静分析型观察者',
    en: 'OBSERVER',
    accent: '#8fb8ff',
    keywords: ['细节控', '先看再动', '冷静区'],
    declaration: '你什么都没说，但你已经看完了全部。',
    description:
      '你走进一个房间，三秒内就知道谁和谁关系好、谁今天心情不对。你不爱先开口，因为信息还没收集齐。对你来说「我觉得」前面永远有半句没说出口的「根据我观察」。',
    traits: [
      '群聊里潜水，但每条都看过',
      '做决定前要先把选项列完',
      '别人吵架时你在心里排时间线',
    ],
    quote: '「我不是冷漠，我只是还在加载。」',
  },
  {
    key: 'explorer',
    code: 'TYPE-03',
    name: '自由探索型冒险家',
    en: 'EXPLORER',
    accent: '#7ee0b8',
    keywords: ['说走就走', '好奇心', '路线之外'],
    declaration: '地图上没有的那条路，才是你今天的日程。',
    description:
      '你对「没试过」三个字毫无抵抗力。别人的周末是计划表，你的是随机事件列表。你会因为一家店的名字好听就坐一小时地铁过去，然后发现它没开门，还觉得挺值得。',
    traits: [
      '出门不看攻略，靠直觉拐弯',
      '对新鲜事的耐心永远比熟事多',
      '迷路的时候反而最开心',
    ],
    quote: '「先别管到不到得了，走错了也是风景。」',
  },
  {
    key: 'healer',
    code: 'TYPE-04',
    name: '温柔治愈型共鸣者',
    en: 'HEALER',
    accent: '#ff9fb0',
    keywords: ['高共情', '会听', '稳定器'],
    declaration: '你不是谁的树洞，你是那个一定会回消息的人。',
    description:
      '你能听出「我没事」里那个停顿。朋友半夜发来一句「在吗」，你不会急着给建议，你先让他把话说完。你记得所有人的忌口和生日，却经常忘记自己也没吃晚饭。',
    traits: [
      '安慰人不靠道理，靠「我在」',
      '记得别人随口提过的小事',
      '习惯替别人的失误找理由',
    ],
    quote: '「你不用马上好起来，我陪着就行。」',
  },
  {
    key: 'host',
    code: 'TYPE-05',
    name: '社交能量型气氛组',
    en: 'ATMOSPHERE',
    accent: '#ffb45c',
    keywords: ['自带 BGM', '破冰', '人来疯'],
    declaration: '你在的地方，冷场都得排队。',
    description:
      '你能在三句话内让一桌陌生人互相加微信。你不是话多，你是知道什么时候该有人说话。安静超过八秒，你会本能地觉得这是自己的责任。',
    traits: [
      '聚会名单默认由你拉',
      '尴尬时会先拿自己开玩笑',
      '群里发通知的那个永远是你',
    ],
    quote: '「别客气，一客气就散了。」',
  },
  {
    key: 'doer',
    code: 'TYPE-06',
    name: '极致执行型行动派',
    en: 'EXECUTOR',
    accent: '#ffd166',
    keywords: ['立刻开始', '目标感', '交付力'],
    declaration: '你想了三天的事，别人已经做完了。',
    description:
      '别人还在讨论方案，你已经交了第一版。你不喜欢「考虑一下」，因为考虑这个词没有截止时间。你的待办清单里从不出现「待定」两个字。',
    traits: [
      '不是三分钟热度，是三分钟启动',
      '最讨厌听到「我们找个时间」',
      '做不完比做不好更让你难受',
    ],
    quote: '「想清楚再做，通常就来不及了。」',
  },
  {
    key: 'dreamer',
    code: 'TYPE-07',
    name: '慢热沉浸型梦想家',
    en: 'DREAMER',
    accent: '#b9a6ff',
    keywords: ['精神世界', '慢热', '深度沉浸'],
    declaration: '你的宇宙不对外开放，但欢迎你常来。',
    description:
      '你在热闹里安静，在安静里热闹。一首歌能听一整个下午，一个设定能想一整晚。别人以为你在发呆，其实你正在给另一个世界写规则。',
    traits: [
      '社交电量有限，独处时满格',
      '喜欢的东西能研究到很细',
      '心里有一份没跟任何人说过的计划',
    ],
    quote: '「我没走神，我只是回去了。」',
  },
  {
    key: 'player',
    code: 'TYPE-08',
    name: '随机应变型快乐玩家',
    en: 'PLAYER',
    accent: '#ff9d8a',
    keywords: ['随机应变', '松弛感', '快乐优先'],
    declaration: '生活给你出题，你给它出选择题。',
    description:
      '计划崩了，你的第一反应是「那更好玩了」。你能把迟到说成偶遇，把迷路说成探店。你不一定是最努力的那个，但你一定是最难被生活打倒的那个。',
    traits: [
      '情绪恢复速度快得有点离谱',
      '一本正经地胡说八道',
      '快乐阈值很低，容易满足',
    ],
    quote: '「既然已经来不及了，那就慢慢来。」',
  },
]

/** key → 人格，供结果页与画布导出查表 */
export const PERSONALITY_MAP: Record<PersonalityKey, Personality> = PERSONALITIES.reduce(
  (acc, item) => {
    acc[item.key] = item
    return acc
  },
  {} as Record<PersonalityKey, Personality>,
)

/** 档案编号顺序（并列决胜时的最终依据，必须稳定） */
export const PERSONALITY_KEYS: readonly PersonalityKey[] = PERSONALITIES.map((item) => item.key)

export function personalityOf(key: PersonalityKey): Personality {
  return PERSONALITY_MAP[key]
}
