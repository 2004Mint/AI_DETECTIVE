# 腾讯云 SCF + COS：国内 Serverless 计票

适合：不想买服务器、想用云厂商免费额度的场景。
形态：**云函数（Node.js 18）+ 函数 URL（HTTPS）+ COS 存一个 JSON**。

> 为什么不能只开个函数？
> 函数实例是无状态的，跑完就回收，票数必须存在函数外面。这里用 COS 存一个
> `dream-votes.json`，每次投票读出来、+1、写回去。

---

## 零、先看这里：整件事长什么样

你要创建 4 样东西，全部在你自己的腾讯云账号下：

1. **一个对象存储桶（COS）** —— 放票数文件
2. **一个子账号密钥** —— 让函数能读写这个桶
3. **一个云函数** —— 跑计票逻辑（代码我已写好，打包上传即可）
4. **一个函数 URL** —— 给前端调的 HTTPS 地址

控制台直达：

| 要做什么 | 地址 |
| --- | --- |
| 实名认证（没做过先做，刷脸 1 分钟） | https://console.cloud.tencent.com/developer |
| 创建 COS 桶 | https://console.cloud.tencent.com/cos/bucket |
| 创建子账号 / 拿密钥 | https://console.cloud.tencent.com/cam |
| 创建云函数 | https://console.cloud.tencent.com/scf/list |

全程约 15–20 分钟，不需要买服务器，也不需要域名。

**检查点**（每步做完应该看到）：

| 步骤 | 你应该看到 |
| --- | --- |
| 建桶 | 桶列表里出现 `dream-vote-xxxxxxxxx`，地域记为 ap-xxx |
| 建密钥 | 弹窗里出现 SecretId / SecretKey（SecretKey 只显示一次，先粘贴到记事本） |
| 传代码 | 函数详情页「函数代码」能预览到 index.js |
| 加触发器 | 出现一条「函数 URL」，形如 `https://xxxx.apigw.tencentcs.com/release` |
| 自测 | 浏览器打开 `<函数URL>/votes` 返回 `{"counts":{},"total":0}` |

> 如果控制台里找不到「函数 URL」，用「API 网关触发器」也能达到同样效果，地址形如
> `https://service-xxxx.gz.apigw.tencentcs.com/release/votes`。

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

会得到 `dist-scf/vote-scf.zip`（内含 `index.js`、`package.json` 和 `node_modules`）。

---

## 三、创建云函数

控制台 → 云函数 → 新建：

| 项 | 值 |
| --- | --- |
| 创建方式 | 从头开始 |
| 函数类型 | 事件函数 |
| 运行环境 | Node.js 18（CommonJS，不要用 .mjs） |
| 提交方法 | 上传 ZIP 包（选上一步的 `vote-scf.zip`） |
| 执行方法 | `index.main_handler`（入口是 CommonJS 的 `index.js`） |
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

---

## 八、本次实际部署记录（2026-11-09）

| 项 | 值 |
| --- | --- |
| 函数名 | `dream-vote` |
| 函数地域 | 广州（ap-guangzhou） |
| COS 桶 | `mint-1351489053`（重庆 ap-chongqing，私有读写） |
| 函数 URL | `https://1351489053-fy0kzncc3f.ap-guangzhou.tencentscf.com` |
| 环境变量 | `TENCENT_SECRET_ID` / `TENCENT_SECRET_KEY` / `COS_BUCKET=mint-1351489053` / `COS_REGION=ap-chongqing` |
| 触发器 | 函数 URL，`AuthType=NONE`，CORS 全开，GET/POST/OPTIONS |
| 前端接入 | `.github/workflows/deploy.yml` 里的 `VITE_VOTE_API` |

已实测：

- `GET /votes` → `{"counts":{},"total":0}`
- `POST /vote {"id":"visual-01"}` → `{"counts":{"visual-01":1},"total":1}`
- 线上双端：A 浏览器投票后，B 浏览器刷新榜单票数同步 +1

### 两个踩坑记录

1. **API 创建函数会报 `UnauthorizedOperation.Role`**：SCF 要求调用方有 `cam:PassRole`，当前密钥没有。
   绕法是先在控制台建一个空函数壳（模板无所谓），再用 `UpdateFunctionCode` / `UpdateFunctionConfiguration` / `CreateTrigger` 三个 API 把代码、环境变量、函数 URL 灌进去——这些都不需要 PassRole。
2. **zip 里不要带 node_modules**：见上面打包说明。

### 安全建议

当前函数的环境变量里存的是**主账号密钥**（为了省事）。更稳的做法是：
新建一个子账号，只授予 `COS` 该桶的读写权限，用它替换函数里的两个环境变量，然后作废旧密钥。