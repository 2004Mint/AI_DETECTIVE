/**
 * ⚠️ 示例数据（不是社团真实作品）
 *
 * 用途：想先看看页面铺满作品后的样子时，把下面的内容复制进
 * `src/data/dream/works.ts`（替换掉文件里的 `export const DREAM_WORKS: DreamWork[] = []`）。
 * 全部作品都**没有封面**，会显示分类渐变占位图 +「占位图」角标，方便你替换成自己的图。
 *
 * 正式上线前请：
 * 1. 换成社团真实作品，或明确标注为示例；
 * 2. 补齐真实素材（public/dream/works、public/dream/audio）；
 * 3. 核实每件作品的创作者署名与 AI 工具，不要编造。
 */
import type { DreamWork } from '@/types/dream'

export const DREAM_WORKS: DreamWork[] = [
  /* ---------------- AI 视觉创作 ---------------- */
  {
    id: 'visual-01',
    title: '雨后的操场，没有人',
    category: 'visual',
    tag: 'AI 风景',
    description: '把「雨后操场的反光」交给 AI，它给了一片比记忆里更安静的水面。',
    prompt:
      '雨后黄昏的校园操场，积水倒映着教学楼与云层，低饱和暖色调，胶片颗粒，35mm，安静无人，远景，柔和逆光 --ar 3:2',
    tool: 'Midjourney v6',
    idea: '想拍一张「放学之后」的照片，但那天没带相机，于是把记忆里的光写成了提示词。',
    creator: '匿名社员',
    voteCount: 12,
    featured: true,
    createdAt: '2026-10-28T19:20:00+08:00',
    tags: ['校园', '胶片感'],
    coverAspect: 'landscape',
  },
  {
    id: 'visual-02',
    title: '会发光的鲸鱼穿过云层',
    category: 'visual',
    tag: 'AI 概念艺术',
    description: '一头由星尘构成的鲸鱼，在晚霞里缓慢游过宿舍楼顶。',
    prompt:
      '巨大的发光鲸鱼漂浮在粉紫色晚霞中，身体由星尘与光带组成，下方是校园宿舍楼剪影，超现实，电影感光影，超广角 --ar 3:4',
    tool: '即梦 图片 3.0',
    idea: '晚自习下课抬头看到一朵很像鲸鱼的云，就想把它真的画出来。',
    creator: '匿名社员',
    voteCount: 21,
    featured: true,
    createdAt: '2026-10-30T21:05:00+08:00',
    tags: ['超现实', '梦'],
    coverAspect: 'portrait',
  },
  {
    id: 'visual-03',
    title: '老教学楼里的橘猫',
    category: 'visual',
    tag: 'AI 人物',
    description: '用 AI 还原那只总在三楼窗台晒太阳的橘猫。',
    prompt:
      '午后阳光穿过旧教学楼的木窗，一只橘猫趴在窗台上，灰尘在光柱里漂浮，暖色调，浅景深，纪实摄影质感 --ar 4:5',
    tool: 'Stable Diffusion XL',
    idea: '毕业前想留一张它的照片，但它从来不配合镜头。',
    creator: '匿名社员',
    voteCount: 34,
    createdAt: '2026-10-25T15:40:00+08:00',
    tags: ['猫', '纪实感'],
    coverAspect: 'portrait',
  },
  {
    id: 'visual-04',
    title: '轻轨穿楼 · 创意海报',
    category: 'visual',
    tag: 'AI 创意海报',
    description: '把「8D 魔幻城市」做成一张可以印出来的海报。',
    prompt:
      '极简瑞士风海报，轻轨从居民楼中间穿过，大面积留白，暖橙与米白双色，粗体中文标题区留空，平面设计感 --ar 2:3',
    tool: 'Midjourney v6 + Photoshop',
    idea: '想给社团做一张「AI 进城市」系列海报，先拿最重庆的元素开刀。',
    creator: '匿名社员',
    voteCount: 9,
    createdAt: '2026-10-22T11:10:00+08:00',
    tags: ['海报', '排版'],
    coverAspect: 'tall',
  },
  {
    id: 'visual-05',
    title: '图书馆穹顶上的银河',
    category: 'visual',
    tag: 'AI 动漫插画',
    description: '如果闭馆后的图书馆，天花板会变成银河。',
    prompt:
      '动漫风格插画，夜晚的图书馆，穹顶变成流动的银河，书桌上散落书本与台灯，暖黄灯光与冷色星空对比，宫崎骏式柔和笔触 --ar 16:9',
    tool: 'NovelAI',
    idea: '期末周在图书馆待到闭馆，抬头那一刻产生的幻觉。',
    creator: '匿名社员',
    voteCount: 18,
    createdAt: '2026-10-26T22:30:00+08:00',
    tags: ['动漫', '图书馆'],
    coverAspect: 'landscape',
  },
  {
    id: 'visual-06',
    title: '一碗小面的说明书',
    category: 'visual',
    tag: 'AI 创意海报',
    description: '用工业说明书的方式，拆解一碗重庆小面。',
    prompt:
      '等距视角插画，重庆小面被拆解成面条、红油、葱花、豌杂等独立部件，标注线，米白背景，技术说明书排版，暖色 --ar 4:3',
    tool: '可灵 图像',
    idea: '外国朋友问「小面到底是什么」，觉得用图解释比用文字快。',
    creator: '匿名社员',
    voteCount: 15,
    createdAt: '2026-11-01T12:00:00+08:00',
    tags: ['美食', '信息图'],
    coverAspect: 'landscape',
  },
  {
    id: 'visual-07',
    title: '机械银杏',
    category: 'visual',
    tag: 'AI 概念艺术',
    description: '秋天掉光叶子的银杏，换成黄铜齿轮重新长一遍。',
    prompt:
      '黄铜与齿轮构成的银杏树，落叶是薄金属片，暖金色，微距细节，暗背景，产品摄影布光，超现实 --ar 3:4',
    tool: 'Midjourney v6',
    idea: '想做一个「自然与机械」的系列，第一张选了校门口那排银杏。',
    creator: '匿名社员',
    voteCount: 7,
    createdAt: '2026-10-20T16:45:00+08:00',
    tags: ['机械', '秋天'],
    coverAspect: 'portrait',
  },
  {
    id: 'visual-08',
    title: '07:30 的食堂',
    category: 'visual',
    tag: 'AI 动漫插画',
    description: '把早八前那十分钟的拥挤，画成一帧动画。',
    prompt:
      '动漫场景，清晨食堂排队买早餐，蒸汽与晨光，人群剪影，暖橙色高光，细节丰富，新海诚式光晕 --ar 16:9',
    tool: '即梦 图片 3.0',
    idea: '每个人都在赶时间，但那一刻的光其实很好看。',
    creator: '匿名社员',
    voteCount: 11,
    createdAt: '2026-10-29T07:35:00+08:00',
    tags: ['校园', '日常'],
    coverAspect: 'landscape',
  },

  /* ---------------- AI 文字创作 ---------------- */
  {
    id: 'text-01',
    title: '把夏天存进手机',
    category: 'text',
    tag: 'AI 短诗',
    description: '同一个提示词，让模型写六行关于夏天的诗。',
    body: `把蝉鸣调成静音
把风扇调到二档
把冰可乐的第一口气
存进相册

夏天太短
只好压缩成一个文件`,
    prompt: '写一首六行的现代短诗，主题是「把夏天存进手机」，语气克制，不要出现「夏天」这两个字以外的季节词。',
    tool: 'DeepSeek',
    idea: '试了很多版，最后留下的是最短、最不抒情的那一版。',
    creator: '匿名社员',
    voteCount: 16,
    createdAt: '2026-10-27T20:10:00+08:00',
    tags: ['短诗', '夏天'],
  },
  {
    id: 'text-02',
    title: '图书馆三楼的三条规则',
    category: 'text',
    tag: 'AI 故事',
    description: '让 AI 用「规则怪谈」的方式写一座图书馆。',
    body: `1. 三楼靠窗第四排的位置，永远不要坐满一小时。
2. 如果你听见有人翻书，但那一排没有人，请不要回头。
3. 闭馆音乐响起时，把书合上，放回原位——哪怕你还没看完。

以上规则由上一届管理员口述，未经验证。`,
    prompt: '以「图书馆三楼的三条规则」为题，写一则 150 字以内的规则怪谈，冷静、克制，不要解释原因。',
    tool: '通义千问',
    idea: '期末在图书馆待太久，和同学开玩笑说这里应该有点怪谈。',
    creator: '匿名社员',
    voteCount: 22,
    createdAt: '2026-10-31T23:15:00+08:00',
    tags: ['怪谈', '微小说'],
  },
  {
    id: 'text-03',
    title: '如果社团招新是一场游戏',
    category: 'text',
    tag: 'AI 趣味文案',
    description: '把招新文案写成游戏任务说明。',
    body: `【主线任务】在展台前停留 60 秒
【支线任务】猜对 2 张 AI 图
【隐藏成就】和社长聊满 5 分钟
【奖励】一个可能改变你大学四年的社团`,
    prompt: '把校园社团招新写成游戏任务说明，四条以内，每条不超过 20 字，语气轻快。',
    tool: 'DeepSeek',
    idea: '大家路过展台都太快了，想用游戏语言让他们停一下。',
    creator: '匿名社员',
    voteCount: 8,
    createdAt: '2026-11-02T09:00:00+08:00',
    tags: ['文案', '招新'],
  },
  {
    id: 'text-04',
    title: '同一场雨，三种写法',
    category: 'text',
    tag: '同主题多风格',
    description: '同一个提示词，只改「文体」两个字，让 AI 写三种雨。',
    body: `【古诗】檐前一夜雨，滴碎读书声。

【新闻】昨日 18 时许，我市出现短时强降雨，部分路段积水，未造成人员伤亡。

【小说】她把伞收起来，站在屋檐下等雨小一点。雨没有变小的意思，她也没有要走的意思。`,
    prompt: '以「一场雨」为同一主题，分别用古体诗、新闻通稿、小说片段各写一段，总字数不超过 120 字。',
    tool: 'Claude',
    idea: '想直观地展示：同一个画面，换文体就是换世界。',
    creator: '匿名社员',
    voteCount: 19,
    featured: true,
    createdAt: '2026-10-24T18:40:00+08:00',
    tags: ['同题', '多风格'],
  },
  {
    id: 'text-05',
    title: '向外星人解释你的专业',
    category: 'text',
    tag: 'AI 创意表达',
    description: '要求：不能使用任何一个专业术语。',
    body: `我们专业研究的是：怎么让机器从「看见」变成「看懂」。

看见，是它知道这里有一团像素。
看懂，是它知道那是一只在打哈欠的猫，而且它现在心情不错。

——如果你还是没懂，就当我们在教机器做梦。`,
    prompt: '向外星人解释「人工智能专业」，禁止使用任何专业术语，三句话以内，最后一句要有点浪漫。',
    tool: 'DeepSeek',
    idea: '每次回家被问「你这个专业到底学什么」，攒了一版标准答案。',
    creator: '匿名社员',
    voteCount: 13,
    createdAt: '2026-11-03T14:20:00+08:00',
    tags: ['科普', '幽默'],
  },

  /* ---------------- AI 音乐创作 ---------------- */
  {
    id: 'music-01',
    title: '逃课的云',
    category: 'music',
    tag: 'AI 原创歌曲',
    description: '一首关于「下午第三节课窗外」的民谣。',
    prompt: '轻快民谣，木吉他 + 口琴，女声，BPM 96，主题是下午逃课看云，副歌要有一句能被记住的旋律。',
    tool: 'Suno v3',
    idea: '先写了两句歌词，剩下的交给模型补完，再挑出最像自己语气的那一版。',
    creator: '匿名社员',
    voteCount: 27,
    featured: true,
    createdAt: '2026-10-29T16:00:00+08:00',
    duration: 96,
    tags: ['民谣', '校园'],
  },
  {
    id: 'music-02',
    title: '夜航',
    category: 'music',
    tag: 'AI 纯音乐',
    description: '没有歌词，适合深夜写作业时循环。',
    prompt: '氛围电子纯音乐，钢琴 + 低频 pad，缓慢推进，无人声，适合深夜学习，3 分钟内。',
    tool: 'Udio',
    idea: '想给「凌晨两点的自习室」配一段背景音。',
    creator: '匿名社员',
    voteCount: 14,
    createdAt: '2026-11-01T01:30:00+08:00',
    duration: 132,
    tags: ['氛围', '纯音乐'],
  },
  {
    id: 'music-03',
    title: '重启',
    category: 'music',
    tag: 'AI 音乐封面',
    description: '电子流行单曲，封面与音频都来自同一个提示词。',
    prompt: '电子流行，合成器前奏，BPM 120，男声，主题是「重新开始」；封面用同一提示词的视觉版本生成。',
    tool: 'Suno v3 + 即梦',
    idea: '试着让「听觉」和「视觉」用同一段描述生成，看它们会不会长得像。',
    creator: '匿名社员',
    voteCount: 10,
    createdAt: '2026-10-21T20:00:00+08:00',
    duration: 108,
    tags: ['电子', '封面'],
  },

  /* ---------------- AI 奇思妙想 ---------------- */
  {
    id: 'idea-01',
    title: '如果猫会说重庆话',
    category: 'idea',
    tag: 'AI 脑洞作品',
    description: '把家猫的日常翻译成重庆话，做成一则短对话。',
    body: `「妈，我饿了。」——「你哪个时候不饿嘛。」`,
    prompt: '写一段重庆方言的短对话，角色是一只猫和它的主人，四句以内，要好笑但不油。',
    tool: 'DeepSeek',
    idea: '猫叫的时候总觉得它在用方言催饭。',
    creator: '匿名社员',
    voteCount: 25,
    createdAt: '2026-10-30T12:10:00+08:00',
    tags: ['方言', '幽默'],
  },
  {
    id: 'idea-02',
    title: '梦里的地铁站',
    category: 'idea',
    tag: '超现实艺术',
    description: '把反复出现的一个梦，逐帧描述给 AI，让它画成一个站台。',
    prompt: '超现实场景，无限延伸的地铁站台，暖黄色灯带，没有乘客，地面倒映着不存在的天空，安静到失真 --ar 16:9',
    tool: '可灵 图像',
    idea: '同一个梦做了三次，这次决定把它固定下来，免得再忘。',
    creator: '匿名社员',
    voteCount: 17,
    createdAt: '2026-10-23T03:20:00+08:00',
    tags: ['梦', '地铁'],
    coverAspect: 'landscape',
  },
  {
    id: 'idea-03',
    title: '一百年后的食堂菜单',
    category: 'idea',
    tag: '创意实验',
    description: '让 AI 按「气候 + 科技」两个变量，推演一份 2126 年的菜单。',
    body: `主菜：培养蛋白小面（碳排 -72%）
配菜：垂直农场豌豆尖
饮品：室内气候调和的「阴天拿铁」`,
    prompt: '设计一份 2126 年大学食堂菜单，三道菜，要能看出气候与科技的痕迹，不要科幻名词堆砌。',
    tool: 'DeepSeek',
    idea: '「以后还能吃到小面吗」——这个问题突然变得不那么好笑。',
    creator: '匿名社员',
    voteCount: 6,
    createdAt: '2026-11-02T18:30:00+08:00',
    tags: ['未来', '菜单'],
  },
  {
    id: 'idea-04',
    title: '把校训画成一座岛',
    category: 'idea',
    tag: '趣味生成结果',
    description: '把校训的每个词，变成岛上的一处地形。',
    prompt: '概念艺术，一座由四个区域组成的岛屿，分别对应「厚德、博学、笃行、创新」，暖色调，俯瞰视角，地图感 --ar 4:3',
    tool: 'Midjourney v6',
    idea: '想给社团做一张「精神地图」，最后变成了真的一座岛。',
    creator: '匿名社员',
    voteCount: 4,
    createdAt: '2026-10-19T10:00:00+08:00',
    tags: ['地图', '校园'],
    coverAspect: 'landscape',
  },
]
