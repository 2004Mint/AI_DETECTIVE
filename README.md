# 🤖 AI 鉴定师 · AI DETECTIVE

校园招新互动小游戏 —— **“哪张图片由 AI 生成？”**

> 重庆外语外事学院 · 人工智能学生研讨与践习社 · 线下摆台招新活动
>
> 玩家扫码进入手机 Web，用 10 道“真实照片 vs AI 生成图”的对局感受 AI 的发展，
> 传递社团理念 —— **“AI 赋能各学科”**。

---

## ✨ 玩法与页面

```
首页 ──▶ 规则 ──▶ 第 1~10 关（二选一）──▶ 结算（称号）──▶ 社团招新页
```

- 每关展示图片 A / B（一张真实的、一张 AI 生成），**点选**你认为 AI 生成的那张 → 再点
  **「确认选择」**提交（点选只表示选中，可以随时改选，不会手滑直接交答案）；
  点图片右上角的放大按钮可以看**完整未裁切的原图**（卡片上是 `object-cover` 裁切过的）；
- **出题规则**：按题材（动物 / 美食 / 风景 / 绘画）随机配对 —— 同一题材内各抽 1 张 AI 图 + 1 张真实图；
  一局 10 题**不重复出题、不重复用图**，四大题材尽量均分（3 / 3 / 2 / 2），
  AI 图的左右位置保持 5 : 5 均衡（规则实现集中在 `src/utils/roundBuilder.ts`）；
- 计分：答对 +100；连击奖励：连对 2 题 +50、3 题 +100、5 题 +200（以 5 连为一周期循环，
  理论最高 **1700 分**）；答错连击归零；
- 答完每题立即揭晓：显示两张图的真实身份（哪张 AI / 哪张真实）与本题得分，并给出研小鸿贴士；
- 称号：0~2 AI 实习生 🐣 / 3~5 AI 观察员 🔭 / 6~7 AI 侦察员 🔍 / 8~9 AI 鉴定师 🕵️ / 10 人类观察大师 👑；
- 挑战途中刷新页面可**断点续玩**（localStorage 快照，键 `ai-detective:run:v2`）。

页面：`HomeView`（首页）/ `RuleView`（规则）/ `GameView`（10 关游戏）/ `ResultView`（结算+称号）/
`RecruitView`（招新，底部预留二维码位）。

## 🛠 技术栈

Vue 3（Composition API + `<script setup>`）· TypeScript（strict，无 any）· Vite ·
Vue Router · Pinia · Tailwind CSS · Lucide Icons

## 🚀 快速开始

```bash
npm install          # 安装依赖
npm run dev          # 本地开发 http://localhost:5173
npm run typecheck    # vue-tsc 类型检查
npm run build        # 类型检查 + 生产构建（输出 dist/）
npm run preview      # 预览构建产物 http://localhost:4173
npm run check:rounds # 素材体检 + 抽题规则自检（换图后跑一次，见「规则四」）
```

构建产物为纯静态文件，放到任意静态服务器/对象存储即可扫码访问
（如 `nginx`、`GitHub Pages`、校园服务器，或 `vite preview`）。

## 🌐 部署到 GitHub Pages

产物是纯静态站，构建 → 发布全流程由 `.github/workflows/deploy.yml` 自动完成：
push 到 `main` 分支（或手动 `Run workflow`）→ 类型检查 + 构建 → 发布 `dist/`。

### 首次上线三步

1. **建仓库并推送**（仓库名建议 `AI_DETECTIVE`；如果是 `用户名.github.io` 这类根路径仓库，工作流会自动改用 `/`）：

   ```bash
   git init -b main
   git add .
   git commit -m "feat: AI 鉴定师招新小游戏"
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

2. **打开 Pages**：仓库 `Settings → Pages → Build and deployment → Source` 选 **GitHub Actions**
   （不用挑分支，工作流用 `actions/deploy-pages` 直接发布构建产物）。

3. 回到 `Actions` 页看 “Deploy to GitHub Pages” 跑完，访问
   `https://<用户名>.github.io/<仓库名>/`。

### 资源路径（base）是怎么处理的

页面用的是 History 路由（`createWebHistory`），**子路径部署必须配对 base**，
否则构建出来的 `/assets/xxx.js` 会去域名根目录找，直接白屏。这里的规则：

| 场景 | base | 什么时候生效 |
| --- | --- | --- |
| 本地 `npm run dev` / `npm run preview` | `/` | 默认值 |
| GitHub Pages 子路径仓库 | `/<仓库名>/` | CI 里按 `github.event.repository.name` 自动推导 |
| 根路径仓库（`用户名.github.io`） | `/` | 同上，自动判断 |
| 想丢到任意目录（相对路径） | `./` | 手动 `VITE_BASE=./ npm run build` |

需要手动构建时（PowerShell 写法，bash 用 `VITE_BASE=/AI_DETECTIVE/ npm run build`）：

```powershell
$env:VITE_BASE="/AI_DETECTIVE/"; npm run build
```

构建会自动额外产出两样东西（`vite.config.ts` 里的插件）：

- `dist/404.html`：GitHub Pages 没有 SPA 回退，深链（如 `.../AI_DETECTIVE/game`）刷新会 404，
  复制一份 `index.html` 当回退页就能正常落到对应路由；
- `dist/.nojekyll`：跳过 Pages 的 Jekyll 处理。

> 部署到 Cloudflare Pages / Vercel / Netlify 也可以：Build command 填 `npm run build`，
> Output directory 填 `dist`，base 用 `/` 或 `./` 都行，平台自带 SPA 回退。


## 📂 目录结构

```
src/
├── api/
│   ├── questions.ts      # 题库访问层：扫描 ai/ real/ 素材 → 按题材随机配对出题
│   └── questionFactory.ts# 素材配对 → 题目（纯函数，题号 / 答案侧 / 文案组装）
├── assets/
│   ├── images/ai/        # ★ AI 生成图素材（<题材>_<序号>）
│   ├── images/real/      # ★ 真实图素材（同题材前缀，序号可与 ai/ 不同）
│   └── main.css          # 全局样式 / 动画 / 路由过渡
├── components/           # GameProgress / QuestionCard / ScorePanel /
│                         # ResultModal / MascotBubble / MascotPet / BgScenery
├── data/question-copy.ts # ★ 研小鸿贴士池 + 各题材标签 / 文案池
├── router/index.ts       # 路由 + 状态守卫（刷新可恢复）
├── stores/game.ts        # Pinia：题目/积分/连击/称号/快照持久化
├── types/game.ts         # 全部 TS 类型
├── utils/
│   ├── assetName.ts      # 素材文件名解析（<题材>_<序号>）
│   ├── random.ts         # 洗牌 / 随机取值（随机源可注入，便于自检）
│   ├── roundBuilder.ts   # ★ 抽题规则：同题材配对、局内不重复、题材均分
│   ├── scoring.ts        # 计分 / 连击 / 称号
│   └── useCountUp.ts     # 数字滚动动画
└── views/                # Home / Rule / Game / Result / Recruit

scripts/check-rounds.ts   # 素材体检 + 抽题规则自检（npm run check:rounds）
```

---

## 🖼 图片素材替换指南（重要）

### 规则一：文件名 = 「题材_序号」

图片放在两个文件夹，**文件名统一为 `<题材>_<序号>`**（分隔符 `_` 或 `-` 都可以，扩展名任意）：

| 目录 | 含义 | 示例 |
| --- | --- | --- |
| `src/assets/images/ai/` | 由 AI 生成的图片 | `animal_1.png` |
| `src/assets/images/real/` | 真实图（相机照片 / 人类画师作品） | `animal_1.jpg` |

- 题材前缀相同的 AI 图与真实图自动组成一个「题材池」（`animal` / `food` / `landscape` / `painting`…）；
- **一道题的两张图一定来自同一个题材池**：在同题材池里随机抽 1 张 AI 图 + 1 张真实图；
- 两边的序号**不需要一一对应** —— `ai/animal_1.png` 完全可能和 `real/animal_4.jpg` 配成一道题，
  序号只用于稳定排序；
- ✅ 支持 `jpg / jpeg / png / webp / avif / gif / svg`；
- ⚠️ 同一题材下不要放同名不同扩展名的文件（`animal_1.png` 与 `animal_1.jpg`），只会用到其中一个；
- ⚠️ 命名不符合 `<题材>_<序号>` 的文件会被跳过，并在浏览器控制台给出 `[题库]` 告警。

> **加图 / 换图只要丢文件进文件夹就行，代码和配置都不用改。**
> 新增一个题材（比如 `city_1.png`）会自动加入出题轮换，只是文案走兜底，
> 按「规则五」补一份文案会更贴切。

### 规则二：当前素材清单

| 题材 | AI 图 | 真实图 | 说明 |
| --- | --- | --- | --- |
| `animal` | `animal_1~5` | `animal_1~5` | 动物：AI 拟真动物照 vs 真实动物照片 |
| `food` | `food_1~5` | `food_1~5` | 美食：AI 拟真美食照 vs 真实美食照片 |
| `landscape` | `landscape_1~5` | `landscape_1~5` | 风景：AI 拟真风景 vs 真实风景照片 |
| `painting` | `painting_1~5` | `painting_1~5` | 绘画：AI 模仿的动画风插画 vs **人类画师作品**（所以真实侧标签是「人类画作」而非「真实照片」） |

**共 40 张素材**：同题材内可组合 5 × 5 = 25 种题目，4 个题材合计 **100 种不重复题目**，
而一局只用 10 题，素材量非常充裕。

**配对建议**：因为是同题材内随机配对，同一题材里的图**风格越接近、构图越像，题目越有挑战性**；
反过来，某个题材里只要有一张特别容易识破的图，它就会以约 1/5 的概率出现在每一道该题材的题里，
明显拉低这个题材的难度 —— 换图时留意这一点。

### 规则三：抽题规则（一局 10 题）

| 规则 | 说明 | 实现位置 |
| --- | --- | --- |
| 同题材配对 | 一道题的两张图必来自同一题材池 | `roundBuilder.buildRoundPairs` |
| 不重复出题 | 一局内「题材 + AI 图 + 真实图」组合互不相同 | 同上（每个 AI 图一局只用一次） |
| 不重复用图 | 一局内任何一张图片都不会出现两次 | 同上（洗牌后整段切片） |
| 题材均分 | 4 个题材分 10 题 = 3 / 3 / 2 / 2（哪个题材多一题随机） | `roundBuilder.planCategoryCounts` |
| 答案均衡 | AI 图落在 A / B 的比例是 5 : 5，避免答案规律被猜到 | `roundBuilder.planAiSides` |
| 素材不足时优雅降级 | 某题材素材不够就把题量摊给其它题材；总量不够就少出几题 | `planCategoryCounts` 容量上限 |

> 「不重复」的范围是**一局之内**（10 题），答完 10 题进入下一局就重新洗牌 ——
> 这正是「出现过的题不会再出现，直到完成 10 道题」的规则。
> 关卡数在 `src/utils/scoring.ts` 的 `TOTAL_ROUNDS` 调整。

### 规则四：换图之后怎么验证

```bash
npm run check:rounds
```

会先**体检素材文件夹**（每个题材的图片数量、命名是否合规、有没有重名、有没有缺配对的题材），
再拿真实素材跑 **2 万局抽题**，逐条验证「同题材配对 / 不重复出题 / 不重复用图 / 题材均分 /
答案均衡 / 题号唯一 / 文案确实取自该题材的文案池」，并额外验证素材不均衡等边界场景。
用的是页面同一份解析、抽题与组装代码（`assetName.ts` / `roundBuilder.ts` / `questionFactory.ts`），
不是另写一套实现，所以自检通过 = 页面行为正确。

### 规则五：改文案（研小鸿贴士 / 题材标签）

题目是动态生成的，所以文案也按「池」准备在 `src/data/question-copy.ts`：

```ts
// ① 研小鸿贴士：全局共用一个池，每题随机取一条
export const MASCOT_HINTS = [
  '别急着确认，两张都放大看一遍再决定 👀',
  'AI 的图经不起放大：一放大，纹理和边缘就开始糊。',
  // ...
]

// ② 题材相关文案：按题材前缀登记
const ANIMAL: CategoryCopy = {
  label: '动物',          // 游戏中展示的题材标签
  realLabel: '真实照片',  // 真实图那一侧的称呼（绘画题材用「人类画作」）
  titles: [],            // 题目角标文案池
  explanations: [],      // 「AI 破绽」讲解池（结果弹窗已不展示知识卡，保留备用）
}
```

> ⚠️ **写 `MASCOT_HINTS` 时不要描述具体画面内容**（比如「看筷子有没有分叉」「看水面倒影」）。
> 因为一道题的两张图是同题材内**随机配对**的，随机抽到没有筷子的图就完全对不上了。
> 这个池子只写「怎么观察」的通用方法，任何题目都成立。

- 键名 = 素材文件夹里的题材前缀（`animal` / `food` / `landscape` / `painting`）；
- 新增题材不补文案也不会报错，会走 `DEFAULT_CATEGORY_COPY` 兜底（题材标签显示原始键名）。

### 规则六：素材技术要求（构图 / 尺寸）

采用**通用横屏 16:9** 比例构图（对战页按 16:9 展示、居中裁切 `object-cover`，
请把主体放在画面中部避免裁边）；建议 ≥1280×720、画质清晰；AI 生成图建议检查
并避免水印/文字乱码（那会让题目一眼识破）。若想改用 4:3 / 3:2 等其他横屏比例，可在
`QuestionCard.vue` 的 `aspectClass` 处补充对应比例类，再在 `GameView.vue` 中把两张卡片的
`aspect="video"` 改为新比例键名即可。

### 招新二维码

二维码图片放在 `public/recruit-qr.png`（当前已接入，源图来自 `src/assets/images/Link/linkQQ.png`），
`RecruitView.vue` 用 `import.meta.env.BASE_URL` 拼路径引用，所以子路径部署（比如 GitHub Pages）
也不会 404。**换二维码只要替换 `public/recruit-qr.png` 这一个文件，代码不用动。**

页面里二维码外面套了一层白色卡片：二维码本身是深色底的，白底能保证手机相机的识别率。
建议二维码原图边长 ≥ 300px、不要带透明通道。

---

## ⚙️ 自定义

- 吉祥物：`src/components/MascotPet.vue`（12 帧表情来自 `src/assets/images/pet` 精灵图，
  由 `scripts/crop-mascot.ps1` 切出，更新表情图后重跑该脚本即可；各调用点用 `emotion` 属性选帧）；
- 主题色：整体采用与研小鸿表情包相容的**暖橙糖果体系**（主色 `#ff8a1c` 围巾橙 + 暖可可夜底 + 奶油点缀，
  冷色仅作科技点缀）。设计令牌集中在 `tailwind.config.js` 与 `src/assets/main.css`（改这里即可全站换肤）；
- 社团名称：首页与招新页文案内直接修改即可。

## 📄 License

仅限重庆外语外事学院人工智能学生研讨与践习社招新活动内部使用。
示例真实照片来自 Lorem Picsum（Unsplash 源摄影作品），替换为自有素材后请自行移除。
