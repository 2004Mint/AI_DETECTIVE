# AI 造梦事务所 · 内容填写与开发说明

> 线上 AI 创意作品展览与互动平台 —— 校园文化节「AI 灵感游乐场」的第二个子项目。
>
> **当前状态：页面、交互、路由、数据层全部完成；作品内容（作品数据 / 图片 / 音频）留空待填。**
> 本文档就是「要填什么、填到哪个文件」的清单。

---

## 一、先跑起来

```bash
npm run dev         # http://localhost:5173  （总入口）
npm run typecheck   # 类型检查
npm run build       # 生产构建
npm run check:dream # 作品数据自检（加完作品跑一次）
```

扫码后先进入总入口 `/`（AI 灵感游乐场），再选板块：

| 路径 | 内容 |
| --- | --- |
| `/` | 总入口：AI 鉴定师 / AI 造梦事务所 / 后续板块占位 |
| `/detective` | AI 鉴定师的三关挑战 |
| `/dream-studio` | 本模块：轻量画廊（品牌 + 分类胶囊 + 两列瀑布流 + 人气榜入口） |

作品数据为空时，画廊位置显示研小鸿 +「作品正在布展中」。
把作品填进 `src/data/dream/works.ts` 后，画廊会自动铺满；分类胶囊就地过滤，不跳页。

> 视觉：造梦事务所与入口页、AI 鉴定师共用同一套主题（暖可可夜底 + 围巾橙 + 星空 + 研小鸿），
> 不再使用独立的浅色主题。

### 三分钟加一件作品

> 不想手写数据？打开 `/admin` 后台可视化录入，导出 `works.ts` + 素材 ZIP 即可（见 [ADMIN.md](./ADMIN.md)）。

**第 1 步：放图**

把作品图放进 `public/dream/works/`，例如 `public/dream/works/visual-01.webp`。
建议宽 ≥ 1200px、单张 ≤ 400KB，优先 WebP；竖图横图都可以，画廊按原图比例完整展示。

**第 2 步：写数据**

打开 `src/data/dream/works.ts`，在 `DREAM_WORKS` 数组里加一条：

```ts
{
  id: 'visual-01',              // 唯一，英文 + 短横线，别和已有作品重复
  title: '作品标题',
  category: 'visual',           // visual / text / music / idea
  cover: 'visual-01.webp',      // 就是第 1 步放进去的文件名
  description: '一句话创作简介',
  prompt: '完整的提示词',
  tool: 'Midjourney v6',        // 使用的 AI 工具
  creator: '匿名社员',           // 可留空
  voteCount: 0,                 // 初始票数，可留空
  createdAt: '2026-11-05T10:00:00+08:00',
}
```

音乐作品多两个字段：`audioUrl: 'music-04.mp3'`（文件放 `public/dream/audio/`）、`duration: 96`（秒，可留空）。
文字作品把正文写进 `body`。

**第 3 步：自检 + 预览**

```bash
npm run check:dream   # 缺图 / id 重复 / 分类写错 / 音频没配对都会提示
npm run dev           # 打开 http://localhost:5173/dream-studio 看效果
```

---

## 二、内容 ↔ 文件对照表（最重要）

| 想改的内容 | 文件 | 位置 / 说明 |
| --- | --- | --- |
| **作品数据（标题 / 简介 / 提示词 / 工具 / 作者 / 票数 / 时间）** | `src/data/dream/works.ts` | `DREAM_WORKS` 数组，文件里已有可直接照抄的字段模板 |
| **作品图片** | `public/dream/works/` | 文件名写进作品的 `cover`（如 `visual-01.webp`） |
| **音乐音频** | `public/dream/audio/` | 文件名写进作品的 `audioUrl`（如 `music-04.mp3`） |
| **文字作品的正文** | `src/data/dream/works.ts` | 填进该作品的 `body` 字段 |
| **四个分类的名称（长/短）/ 说明 / 标签** | `src/data/dream/categories.ts` | `DREAM_CATEGORIES`，`label` 是完整名，`short` 是胶囊与卡片上的短名 |
| 首页标题与副标题 | `src/views/dream/DreamHomeView.vue` | 搜索「让每一个奇思妙想」 |
| 页脚署名 / 合规说明 | `src/components/dream/DreamShell.vue` | 底部 `<footer>` |
| 留言文案 / 长度限制（首页已不展示） | `src/components/dream/MessageBoard.vue`；限制常量在 `src/utils/dream.ts` 的 `MESSAGE_MIN` / `MESSAGE_MAX` | 组件与数据保留，需要时可放回任意页面 |
| 投票规则文案 | `src/components/dream/VoteButton.vue` |  |
| 作品字段类型定义 | `src/types/dream.ts` | 改结构时的唯一来源 |

---

## 三、作品字段说明

只有 `id` / `title` / `category` 是必填，其余缺省时页面会自动降级（显示「待补充」或用占位图）。

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | ✅ | 唯一字符串，用于 `/dream-studio/work/:id` 与投票统计。建议 `visual-01` 这种英文短横线格式 |
| `title` | ✅ | 作品标题 |
| `category` | ✅ | `visual` / `text` / `music` / `idea` |
| `cover` |  | 作品图片。只写文件名 → 自动指向 `public/dream/works/`；也可写完整 URL。**留空显示中性的「待补充作品图片」块**，不会破图 |
| `media` |  | 详情页媒体类型：`image` / `text` / `audio`；不填按分类推断（text→文字、music→音频、其余→图片） |
| `description` |  | 创作简介（详情页展示） |
| `body` |  | 文字作品正文（短诗 / 故事 / 文案） |
| `tool` |  | 使用的 AI 工具，如 `Midjourney v6`、`Suno v3` |
| `prompt` |  | 原始提示词（详情页可一键复制） |
| `creator` |  | 创作者署名；**留空显示「匿名社员」** |
| `voteCount` |  | 初始票数（往期累计 / 线下统计），本机投票会叠加在上面 |
| `createdAt` |  | ISO 时间字符串，决定画廊排序（新的在前） |
| `audioUrl` | 音乐 | 音频文件名 → 自动指向 `public/dream/audio/` |
| `duration` | 音乐 | 时长（秒），音频元数据加载前先显示 |

> 以下字段仍在类型里保留（数据结构不变），但轻量化改版后页面暂不展示：
> `coverAspect`（画廊改为按原图比例完整展示，不再固定裁切）、
> `tag` / `tags`（不再显示标签墙）、`idea`（创作思路区块已移除）、`featured`（精选区已移除）。

---

## 四、图片与音频

### 图片

```
public/dream/works/visual-01.webp
public/dream/works/text-01.webp      # 文字作品想配图也可以
```

- 支持 `jpg / jpeg / png / webp / avif / gif / svg`；建议宽 ≥ 1200px、单张 ≤ 400KB，优先 WebP；
- **不同比例都可以**：画廊按原图比例完整展示，不裁切；竖图、横图混排会形成自然的高低错落；
- 没有图也能上线：`cover` 留空会显示一块中性底色 +「待补充作品图片」，**不伪装成作品、也不会破图**。

### 音频

```
public/dream/audio/music-04.mp3
```

- 推荐 `mp3` / `m4a`（iOS 兼容性最好），建议 ≤ 3MB、90 秒以内；
- `audioUrl` 留空时详情页显示「音频正在上传中」，播放器不会变成坏控件。

---

## 五、先用示例数据看效果（可选）

`docs/dream-studio/works.sample.ts` 里有 **20 条示例作品**（8 视觉 / 5 文字 / 3 音乐 / 4 奇思妙想），
用来预览「作品铺满」之后的页面效果。

用法：把该文件的全部内容复制，覆盖 `src/data/dream/works.ts` 即可（示例数据没有封面，会显示中性的「待补充作品图片」块）。

> ⚠️ 示例数据只用于预览，**不是社团真实作品**。正式展出前请替换为真实内容，或明确标注为示例。

---

## 六、投票与留言的现状（重要）

| 能力 | 实现 | 说明 |
| --- | --- | --- |
| 投票 | Pinia store + `localStorage`（键 `ai-dream-studio:v1`） | 每台设备每件作品 **1 票**，投后按钮禁用，防重复投票 |
| 投票统计 | 作品 `voteCount` + 本机票数 | 换设备 / 清缓存会重新开始，页面已如实标注 |
| 留言 | 同上，`status: 'pending'` | 长度 4~120 字，昵称选填（≤12 字），不收任何个人信息。**首页已不再展示留言板，组件与数据保留**（`MessageBoard.vue`） |
| 留言安全 | 纯文本插值（Vue 自动转义）+ 控制字符清洗 | **不渲染 HTML** |
| 管理员审核 | `src/stores/dream.ts` 的 `setMessageStatus` / `removeMessage` | 预留接口，等接入后端后由服务端鉴权调用 |

**项目没有任何后端**（`api/` 里是本地素材扫描，不是 HTTP 接口），所以没有「复用已有投票/评论接口」这一项。
这也是为什么投票和留言都明确标注为「本机存储」。

### 以后接后端要改哪里

只有两处：

1. `src/utils/dreamStorage.ts` —— 把读写换成接口调用；
2. `src/stores/dream.ts` —— `vote()` 与 `addMessage()` 改成异步（页面里已按「返回结果」的方式调用，改动很小）。

排行榜、详情页都消费 store，不需要改。

---

## 七、路由

| 路由 | 页面 | 说明 |
| --- | --- | --- |
| `/` | `PortalView` | 总入口：板块导航（以后新板块加在这里） |
| `/detective` | `HomeView` | AI 鉴定师首页（原来的 `/`） |
| `/dream-studio` | `DreamHomeView` | 造梦首页：品牌区 + 分类胶囊 + 两列瀑布流画廊 + 人气榜入口 |
| `/dream-studio/category/:category` | `DreamCategoryView` | 分类页（深链兼容）；`:category` = `visual` / `text` / `music` / `idea`；**`all` 表示全部作品** |
| `/dream-studio/work/:id` | `DreamWorkView` | 作品详情：大图 / 播放器 + 名称 / 分类 / 简介 / 工具 / Prompt / 投票 |
| `/dream-studio/ranking` | `DreamRankingView` | 人气榜：单列紧凑列表，前三名略突出 |

入口与返回：

- 入口页 `/` 里有两张板块卡片，点「AI 造梦事务所」进来；
- 造梦事务所**顶栏左上角**是「‹ 游乐场」返回入口，右上角是「人气榜」；
- AI 鉴定师首页**左上角**同样是「‹ 游乐场」；结算页 / 招新页的「返回首页」也回到入口页。

---

## 八、目录结构（新增部分）

```
public/dream/
├── README.md                 # 素材放置说明
├── works/                    # 作品图片（待填）
└── audio/                    # 音乐音频（待填）

src/
├── types/dream.ts            # 作品 / 留言类型
├── data/dream/
│   ├── categories.ts         # 四个分类：长名 / 短名 / 图标 / 说明 / 标签
│   └── works.ts              # ★ 作品数据（待填）
├── stores/dream.ts           # 投票 + 留言（本机持久化）
├── utils/
│   ├── dream.ts              # 排序 / 筛选 / 投票合计 / 素材路径 / 留言校验
│   └── dreamStorage.ts       # localStorage 读写与脏数据清洗
├── assets/dream.css          # 造梦主题：深色画廊（与全站视觉一致）
├── components/dream/
│   ├── DreamShell.vue        # 页面外壳：研小鸿 + 品牌 + 人气榜 + 页脚
│   ├── FilterTabs.vue        # 分类胶囊（就地筛选）
│   ├── WorkGallery.vue       # 画廊：瀑布流 / 空状态
│   ├── WorkGrid.vue          # 瀑布流容器（2 / 3 / 4 列）
│   ├── WorkCard.vue          # 卡片：图片 + 标题 + 分类 + 票数
│   ├── WorkCover.vue         # 图片：原比例展示 / 懒加载 / 占位兜底
│   ├── VoteButton.vue        # 投票
│   ├── AudioPlayer.vue       # 音乐试听（播放 / 暂停 / 进度）
│   ├── PromptCard.vue        # 提示词 + 复制
│   ├── DreamLightbox.vue     # 图片放大
│   ├── RankRow.vue           # 排行榜单行
│   ├── EmptyState.vue        # 空状态（研小鸿打招呼）
│   └── MessageBoard.vue      # 创意留言（首页已不展示，代码与数据保留）
└── views/dream/
    ├── DreamHomeView.vue
    ├── DreamCategoryView.vue
    ├── DreamWorkView.vue
    └── DreamRankingView.vue
```

---

## 九、验收清单

- [ ] 手机端（360 / 390 / 430）：首屏就能看到作品，页面没有横向滚动条
- [ ] `npm run check:dream` 通过（无缺图 / 无重复 id / 分类合法）
- [ ] 分类胶囊：切换后画廊立即过滤并有轻量淡入，不跳页
- [ ] 图片：按原图比例完整展示、不裁切；懒加载；加载完成淡入
- [ ] 详情：大图点击可放大；音乐可播放 / 暂停 / 拖动进度
- [ ] 投票：点一次成功、按钮变「已投票」且不可再投；刷新后仍是已投状态
- [ ] 排行榜：按票数降序，前三名略突出，其余为紧凑单列
- [ ] 空数据：首页 / 分类 / 榜单都是干净的空状态，没有彩色假图
- [ ] 深链：直接打开 `/dream-studio/work/<id>` 正常；不存在的 id 显示兜底页
- [ ] 入口：`/` 两张板块卡片可进入各自模块，页脚 / 模块内都能回到入口
- [ ] AI 鉴定师：`/detective`、`/rule`、`/game`、`/result`、`/recruit` 全部不受影响

---

## 十、轻量化改版说明

### 删除的模块

- 首页统计（作品数 / 分类数 / 票数）
- 精选作品大卡片区域
- 首页完整人气榜预览（只保留顶部一个「人气榜」入口）
- 首页底部创意留言表单（组件 `MessageBoard.vue` 与数据保留，页面不再渲染）
- 分类卡片网格（改成一行文字胶囊）
- 装饰光斑 / 颗粒 / 渐变文字 / 大阴影卡片 / 标签墙 / 创作思路区块 / 同类推荐 / 分享按钮

### 保留的能力

- 四个分类 + 全部作品浏览；两列瀑布流（手机）/ 3–4 列（平板与桌面）
- 作品详情：大图放大、音乐播放 / 暂停 / 进度、Prompt 一键复制
- 投票（Pinia + localStorage，每设备每作品 1 票，防重复）
- 人气榜（按真实票数排序）
- 深链与刷新（`/dream-studio/work/:id`、`/dream-studio/category/:category`）
- 空状态、图片失败兜底、无音源提示
- 创意留言的组件、store、长度校验与审核状态字段

### 视觉调整

- 与 AI 鉴定师统一：暖可可夜底、围巾橙点缀、玻璃卡片、星空背景
- 分类胶囊用玻璃高亮；图片直接铺在背景上，只留 1px 亮边
- 图片按原图比例完整展示，不裁切
- 空状态改用研小鸿；入口页与造梦顶栏也复用研小鸿形象
- 动效只保留：分类切换淡入、图片加载淡入、点击透明度反馈

