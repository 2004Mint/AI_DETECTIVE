# 全站入场动效（v-reveal）

三个活动（AI 鉴定师 / AI 造梦事务所 / AI 人格研究所）现在共用一套入场动效，
统一由 **全局指令 `v-reveal`** 驱动，底层是 GSAP。

```vue
<section v-reveal>…</section>
<h1 v-reveal="60">…</h1>
<li v-for="(item, i) in list" :key="item.id" v-reveal="120 + i * 70">…</li>
```

## 一、动的是什么

| 页面 | 编排 |
| --- | --- |
| `/` 入口 | 标题 → 研小鸿 → 三张活动卡（逐张 70ms）→ 占位卡 → 页脚 |
| `/detective` | 社团横幅 → 主标题 → A/B 预览 → 文案 → 研小鸿 → CTA → 页脚 |
| `/rule` | 五个信息块依次出现 |
| `/game` | 题干 → 提示 → A 卡 → B 卡（每次换题都会重播） |
| `/result` | 结算块依次出现（分数本身是原来的数字滚动） |
| `/recruit` | 三个区块依次出现 |
| `/dream-studio` 系列 | 首页 hero/gallery、分类页标题/作品墙、作品详情信息与 Prompt、人气榜每行（最多 12 行错峰） |
| `/personality` | 首屏 → 样本档案 → 研小鸿 |
| `/personality/result` | 票根卡有自己的 GSAP 时间线（见 docs/PERSONALITY.md） |

## 二、手感参数（和结果页一致）

- 位移 `y: 16px`，时长 `0.5s`，缓动 `power2.out`
- 同屏元素的延迟按 70ms 递增，最多排到 ~450ms
- 只动 `transform` / `opacity`，不触发重排
- 全局页面切换过渡已改为**纯淡入淡出**（0.2s），位移交给 `v-reveal`，避免两层位移叠加

## 三、稳健性

| 情况 | 行为 |
| --- | --- |
| 系统开启「减少动态效果」 | 指令直接返回，元素保持原样 |
| GSAP 首次加载慢 / 失败 | 最多等 350ms，超时立即恢复显示，不出现空白 |
| 元素在首屏之外 | 只淡入、不做位移，滚动到它时不会「跳一下」 |
| 组件在动画开始前被卸载 | 检查 `el.isConnected`，不做任何事 |
| 单页只挂载一次 | 动画只在进入页面时播一次，不随状态变化重复 |

GSAP 只在**第一次用到时**下载（约 28KB gzip），并且应用启动时就会预取；
其他路由不会额外请求。

## 四、怎么调

- 想改整体节奏：调 `src/directives/reveal.ts` 里的默认 `y` / `duration`；
- 想给某个区块加延迟：`v-reveal="60"` 或 `v-reveal="{ delay: 60, y: 24 }"`；
- 想彻底关掉动画：把该元素的 `v-reveal` 删掉即可，样式不依赖它。

## 五、相关文件

- `src/directives/reveal.ts` — 指令实现（懒加载、超时兜底、减少动效）
- `src/main.ts` — 全局注册
- `src/assets/main.css` — 页面切换过渡（改为纯淡入淡出）

---

## 六、入口页三张卡片的专属入场

三张卡片不是同一个「淡入上浮」，各自对应活动的内容气质，
实现在 `src/utils/portalEnter.ts`（`playPortalIntro`）：

| 卡片 | 预设 | 动作 |
| --- | --- | --- |
| AI 鉴定师 | `scan` | 从左侧滑入 22px；一道橙色扫描光横扫卡面后淡出；图标像锁定目标一样从 0.72 弹到 1 |
| AI 造梦事务所 | `float` | 上浮 26px + 放大 0.93→1（expo.out）；斜向高光扫过；三粒星尘上浮后消失 |
| AI 人格研究所 | `unfold` | `clip-path` 从下往上展开卡片（像拉开档案），同时顶部画出一道紫色细线并淡出 |

三张卡的启动时间依次相差 130ms，整段约 1.1 秒结束。
执行完会 `clearProps`，把 hover / active 交还给 Tailwind。

实现细节（踩过的坑都在这）：

- 卡片原来的 `transition-all` 会和 GSAP 每帧写入的 transform 打架，导致透明度来回跳；
  已改成 `transition-colors`（只过渡背景色），按压缩放保持瞬时反馈。
- 先同步把三张卡设为 `opacity: 0` 再加载 GSAP，避免「先亮一下再消失」。
- GSAP 加载失败或超时（350ms）时立即恢复显示。
- 卡片初始态在 `gsap.set()` 里设置，而不是写在 `fromTo` 里——否则延迟期间会闪一下。
---

## 七、页面转场遮罩

两个方向刻意做成不同的「语法」：进入是「卡片被拉成一页」，返回是「横向擦回去」。

### 7.1 进入活动页：从卡片展开 → 向上收起

| 阶段 | clip-path | 时长 |
| --- | --- | --- |
| 初始 | `inset(卡片矩形 round 22px)` —— 遮罩正好盖住被点的那张卡 | — |
| 铺满 | `inset(0 0 0 0 round 0)` | 0.42s power4.inOut |
| 跳转 | 铺满状态下 `router.push` | 80ms 缓冲 |
| 收起 | `inset(0% 0% 100% 0%)`，从下往上掀开 | 0.42s power3.inOut |

### 7.2 返回游乐场：左进 → 右出

| 阶段 | clip-path | 时长 |
| --- | --- | --- |
| 初始 | `inset(0% 100% 0% 0%)`（贴在左边缘、宽度 0） | — |
| 扫入 | `inset(0% 0% 0% 0%)`（右边界推到 100%） | 0.4s power4.inOut |
| 跳转 | 铺满状态下 `router.push('/')` | 70ms 缓冲 |
| 扫出 | `inset(0% 0% 0% 100%)`（左边界推到 100%，滑出右边） | 0.42s power4.inOut |

遮罩内容：模块图标（进入时从卡片复制 SVG，返回时换成返回箭头）+ 活动名 + 英文名。
进入是 `ENTERING / AI 造梦事务所 / DREAM STUDIO`，返回是 `BACK TO PARK / 返回游乐场 / AI INSPIRATION PARK`。

相关文件：`src/utils/pageWipe.ts`、`App.vue` 的 `#page-wipe` 节点、`main.css` 的 `.page-wipe*`。

## 八、哪些入口会触发

| 入口 | 位置 | 走的动画 |
| --- | --- | --- |
| 点活动卡片 | 入口页三张卡 | `enterWithWipe`：卡片展开 + 向上收起 |
| 顶栏「‹ 游乐场」 | 造梦 / 人格的外壳 | `leaveToPlayground`：左进右出 |
| 左上角「游乐场」 | 鉴定师首页 | 同上 |
| 「返回首页」按钮 | 结算页 / 招新页 | 同上（按钮不是 `<a>`，用 `goHome()` 手动接） |

全局监听在 `App.vue` 的捕获阶段：匹配 `a[href="/"]` → `preventDefault()` → 播退场 → `router.push('/')`；
RouterLink 的 `guardEvent` 会识别 `defaultPrevented`，不会重复跳转。`data-no-wipe` 可以让某个链接跳过。

保护措施：

- `busy` 锁防连点；`isPageWiping()` 为真时全局监听直接放行，不吞导航；
- 路由跳转失败也会把遮罩收掉；
- `prefers-reduced-motion` 或 GSAP 加载失败 → 直接跳转；
- 进入时卡片矩形必须在跳转**前**量取。

想改速度：0.42（进入铺满）/ 0.42（进入收起）/ 0.4（返回扫入）/ 0.42（返回扫出）。
想改方向：返回方向改 `HIDDEN_LEFT`、`OFF_RIGHT` 两个常量即可。
