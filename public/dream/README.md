# 作品素材放置说明（public/dream）

这个目录存放「AI 造梦事务所」的静态素材，构建时会原样复制到 `dist/dream/`。

## 1. 作品图片 → `works/`

```
public/dream/works/visual-01.webp
public/dream/works/music-04.webp
```

在作品数据里只写文件名即可：

```ts
{ cover: 'visual-01.webp' }   // → /dream/works/visual-01.webp
```

- 支持 `jpg / jpeg / png / webp / avif / gif / svg`；建议宽度 ≥ 1200px、单张 ≤ 400KB；
- 推荐 WebP：手机加载更快，AI 图与真实图混排时也更省流量；
- 也支持写子目录（如 `works/2026/a.webp`）和完整 URL（`https://…`）；
- **没有图片也能用**：`cover` 留空时会自动显示分类渐变占位图，并带「占位图」角标。

## 2. 音乐音频 → `audio/`

```
public/dream/audio/music-04.mp3
```

```ts
{ audioUrl: 'music-04.mp3' }  // → /dream/audio/music-04.mp3
```

- 推荐 `mp3` 或 `m4a`（iOS 兼容性最好），单曲建议 ≤ 3MB / 90 秒以内；
- `audioUrl` 留空时，详情页播放器会显示「音频正在上传中」，不会出现坏掉的控件。

## 3. 换素材不用改代码

只要文件名和作品数据里写的一致，替换文件即可生效（`npm run dev` 会自动刷新）。

