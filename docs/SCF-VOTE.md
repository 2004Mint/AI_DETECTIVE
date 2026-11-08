# 腾讯云 SCF + COS：国内 Serverless 计票

适合：不想买服务器、想用云厂商免费额度的场景。
形态：**云函数（Node.js 18）+ 函数 URL（HTTPS）+ COS 存一个 JSON**。

> 为什么不能只开个函数？
> 函数实例是无状态的，跑完就回收，票数必须存在函数外面。这里用 COS 存一个
> `dream-votes.json`，每次投票读出来、+1、写回去。

---

## 一、准备（约 10 分钟）

### 1. 建一个 COS 存储桶

控制台 → 对象存储 → 存储桶列表 → 创建：

| 项 | 值 |
| --- | --- |
| 名称 | `dream-vote-你的账号ID`（例如 `dream-vote-1250000000`） |
| 地域 | 广州 / 上海 / 北京都行，**记住它** |
| 访问权限 | **私有读写**（函数用密钥访问，不要开公有） |

### 2. 建一个子账号密钥

控制台 → 访问管理 → 用户 → 新建用户 → **自定义创建 / 编程访问**。

给这个子账号一条策略：`QcloudCOSDataFullControl`（或更小：只允许该桶的 GetObject / PutObject）。

创建完成后记下 `SecretId` 与 `SecretKey`（**只显示一次**）。

---

## 二、打包函数

在项目根目录执行：

```powershell
pwsh scripts/pack-scf.ps1
```

会得到 `dist-scf/vote-scf.zip`（内含 `index.mjs`、`package.json` 和 `node_modules`）。

---

## 三、创建云函数

控制台 → 云函数 → 新建：

| 项 | 值 |
| --- | --- |
| 创建方式 | 从头开始 |
| 函数类型 | 事件函数 |
| 运行环境 | Node.js 18 |
| 提交方法 | 上传 ZIP 包（选上一步的 `vote-scf.zip`） |
| 执行方法 | `index.main_handler` |
| 内存 / 超时 | 128 MB / 5 秒 |
| **并发上限** | **1**（重要：避免多人同时投票互相覆盖） |

环境变量（函数配置 → 环境变量）：

```
TENCENT_SECRET_ID   = 子账号 SecretId
TENCENT_SECRET_KEY  = 子账号 SecretKey
COS_BUCKET          = dream-vote-1250000000
COS_REGION          = ap-guangzhou
```

---

## 四、开一个公网 HTTPS 地址

函数详情 → 触发器 → 创建：

| 项 | 值 |
| --- | --- |
| 触发方式 | **函数 URL** |
| 请求方法 | GET、POST（允许全部也行） |
| 鉴权方式 | **无需鉴权** |

保存后拿到形如 `https://xxxx-xxxx.apigw.tencentcs.com/release/` 的地址。

> 这个默认域名**不需要备案**；以后要换成自己的域名才需要。

自测：

```bash
curl https://<你的函数URL>/votes
curl -X POST https://<你的函数URL>/vote -H "Content-Type: application/json" -d '{"id":"visual-01"}'
```

第一次 GET 返回 `{"counts":{},"total":0}` 就对了。

---

## 五、接到前端

构建时注入地址（注意末尾**不要**带斜杠）：

```bash
VITE_VOTE_API=https://xxxx-xxxx.apigw.tencentcs.com/release
```

GitHub Actions 里改 `.github/workflows/deploy.yml`：

```yaml
      - name: 类型检查 + 构建
        env:
          VITE_BASE: ${{ steps.base.outputs.path }}
          VITE_VOTE_API: https://xxxx-xxxx.apigw.tencentcs.com/release
        run: npm run build
```

推上去重新部署，人气榜就会出现「全站实时票数」和刷新按钮。

---

## 六、成本与限制

| 项 | 说明 |
| --- | --- |
| SCF 费用 | 每月 100 万次调用 + 40 万 GBs 免费额度，几百票用不到零头 |
| COS 费用 | 存储几 KB，几乎为 0；请求费按万次几分钱 |
| 并发 | 函数并发上限设为 1 时，投票是串行的，不会丢数；几百人同时点也能排队处理 |
| 冷启动 | 首次调用约 1 秒，之后很快；页面本身不受影响（只有投票时等一下） |
| 备案 | 函数 URL 默认域名不用；换自定义域名才需要 |
| 限流 | 函数里没有做 IP 限频（SCF 侧可配置），需要的话我可以加 |

---

## 七、常见问题

**Q：投票后票数没变？**
看函数日志（控制台 → 云函数 → 日志）。多半是 COS 权限不足或桶名/地域填错，返回 403。

**Q：多人同时投票会不会丢？**
并发上限保持 1 就不会。若调到 >1，需要把存储换成支持原子自增的服务（例如云开发数据库的事务）。

**Q：能不能不挂 COS？**
可以换成腾讯云「云开发数据库」，但要多装一个 SDK、多一个环境 ID，步骤并不更少。

**Q：函数 URL 打不开？**
确认触发器里的鉴权是「无需鉴权」，并确认函数 URL 的路径包含 `/release` 前缀（控制台会给完整地址）。
