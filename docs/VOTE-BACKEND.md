# AI 造梦事务所 · 共享计票（可选后端）

默认情况下，投票只存在每个人自己的浏览器里：换一台手机就是另一份票数，
所以「人气榜」看到的是本机记录 + 作品数据里的初始票数。

如果你希望**所有人看到同一份实时人气榜**，接一个很小的计票接口即可——
仓库里已经准备好了代码（`workers/vote-worker.js`，Cloudflare Worker + KV，免费额度足够校园活动）。

---

## 一、接口约定（换成任何后端都可以）

| 方法 | 路径 | 说明 | 返回 |
| --- | --- | --- | --- |
| `GET` | `/votes` | 取全站票数 | `{ "counts": { "visual-01": 12 }, "total": 37 }` |
| `POST` | `/vote` | 给某件作品 +1，body `{ "id": "visual-01" }` | 同上（递增后的结果） |

要求：

- 允许跨域：`Access-Control-Allow-Origin: *`，`POST` 允许 `Content-Type: application/json`；
- 返回 JSON，字段名必须是 `counts`（对象）与 `total`（数字）；
- 失败返回非 2xx 即可，前端会自动退回本机模式。

## 二、部署 Cloudflare Worker（约 5 分钟）

```bash
npm i -g wrangler          # 或直接用 npx wrangler
wrangler login             # 浏览器里授权
wrangler kv namespace create VOTES   # 复制返回的 id
```

把 id 填进仓库根目录的 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "VOTES"
id = "刚刚拿到的 id"
```

然后：

```bash
wrangler deploy
# 输出形如 https://dream-vote.<你的子域>.workers.dev
```

## 三、让前端用上它

在构建时注入环境变量（本地可以建 `.env.local`，线上建议加到 GitHub Actions）：

```bash
VITE_VOTE_API=https://dream-vote.<你的子域>.workers.dev
```

GitHub Pages 的做法：编辑 `.github/workflows/deploy.yml` 的构建步骤，加一行 `env:`：

```yaml
      - name: 类型检查 + 构建
        env:
          VITE_BASE: ${{ steps.base.outputs.path }}
          VITE_VOTE_API: https://dream-vote.<你的子域>.workers.dev
        run: npm run build
```

推上去重新部署即可。之后：

- 人气榜顶部会出现「全站实时票数」与「刷新」按钮；
- 投票时前端会 POST 到接口，成功后所有人看到的票数一起变；
- 接口挂了或超时（6 秒）会自动退回本机计数，并在页面提示「同步失败」，不会白屏。

## 四、注意事项

| 事项 | 说明 |
| --- | --- |
| 去重 | 每台设备每件作品 1 票是**前端**限制；服务端没有身份校验，手工调接口仍可重复投。需要严格时可加 Cloudflare Turnstile 或按 IP 限频。 |
| 并发 | Worker 里是 KV 单 key 读-改-写，几百票量级没问题；要扛高并发可换成 Durable Object 或 D1，接口不用变。 |
| 数据归属 | 票数存在你自己的 Cloudflare 账号里，随时可以导出。 |
| 费用 | Workers 免费额度：每天 10 万次请求；KV 免费额度：每天 10 万次读、1000 次写。活动现场足够。 |
| 备用方案 | 学校有 PHP/Node 主机也可以按上面的两个接口自己写，只要返回同样的 JSON 就行。 |

## 五、相关代码

- `src/utils/voteApi.ts` — 前端请求层（超时、形状校验）
- `src/stores/dream.ts` — `vote()` / `syncVotes()` / `displayVotes`
- `workers/vote-worker.js` — Worker 实现
- `wrangler.toml` — 部署配置

---

## 六、三种部署形态，挑一个

| 形态 | 适合 | 文档 |
| --- | --- | --- |
| **腾讯云 SCF + COS**（国内 Serverless） | 不想买服务器、用云厂商免费额度 | [docs/SCF-VOTE.md](SCF-VOTE.md) |
| **自托管 Node 服务** | 有台常开的服务器/VPS/校内主机 | `server/vote-server.mjs`（零依赖，静态页 + 计票一体） |
| **Cloudflare Worker** | 有自己域名（`*.workers.dev` 在国内被墙） | `workers/vote-worker.js` + `wrangler.toml` |

三种都遵守上面的两个接口，前端只需改 `VITE_VOTE_API`；自托管形态可以直接写 `self`（同源）。