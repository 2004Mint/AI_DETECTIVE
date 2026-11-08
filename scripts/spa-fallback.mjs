#!/usr/bin/env node
/**
 * 生成 SPA 的 404 兜底页
 *
 * GitHub Pages 是纯静态托管：直接访问 /AI_DETECTIVE/personality 这类前端路由，
 * 服务器找不到对应文件，就会返回 404。把构建出来的 index.html 复制一份到 404.html，
 * 浏览器拿到 404 状态码但仍会渲染应用，Vue Router 再按路径显示正确页面——
 * 这样刷新、分享子页面链接都不会白屏。
 */
import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(process.cwd(), 'dist')
const index = resolve(dist, 'index.html')
const fallback = resolve(dist, '404.html')

if (!existsSync(index)) {
  console.error('未找到 dist/index.html，请先执行 vite build')
  process.exit(1)
}

copyFileSync(index, fallback)
console.log('已生成 dist/404.html（SPA 子路由兜底）')
