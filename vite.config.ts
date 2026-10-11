import { fileURLToPath, URL } from 'node:url'
import { copyFileSync, existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * 资源基础路径 base
 * - 默认 '/'：本地 `npm run dev` / `npm run preview` 和根路径部署（如 xxx.github.io）用
 * - 子路径部署（如 GitHub Pages 的 /AI_DETECTIVE/）在构建时注入：
 *     VITE_BASE=/AI_DETECTIVE/ npm run build
 *   CI 里由 .github/workflows/deploy.yml 按仓库名自动推导，不需要手改这里。
 * - 想用相对路径构建（产物丢到任意目录都能开）就传 VITE_BASE=./
 *
 * ⚠️ 必须是完整路径（以 / 开头、以 / 结尾）或 './'：SPA 用的是 History 路由，
 *    相对 base 在深层路由下会算错资源目录。
 */
const base = process.env.VITE_BASE || '/'

/**
 * SPA 深链回退：把 index.html 复制一份成 404.html。
 *
 * GitHub Pages 是纯静态托管，没有 Nginx 的 `try_files` 那种回退，
 * 所以直接访问/刷新 /AI_DETECTIVE/game 这类深链会拿到 404。
 * 复制 404.html 后，Pages 会把找不到的路径交回给应用（软 404），
 * 配合 createWebHistory(base) 就能正常落到对应路由。
 * 只对 Pages 这种需要回退的托管有意义，本地开发不受影响。
 */
function spa404Fallback(): Plugin {
  return {
    name: 'ai-detective:spa-404-fallback',
    apply: 'build',
    closeBundle() {
      const dist = fileURLToPath(new URL('./dist', import.meta.url))
      const index = resolve(dist, 'index.html')
      if (!existsSync(index)) return
      // 深链回退页
      copyFileSync(index, resolve(dist, '404.html'))
      // .nojekyll：让 GitHub Pages 跳过 Jekyll 处理（否则下划线开头的文件会被忽略）
      writeFileSync(resolve(dist, '.nojekyll'), '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [vue(), spa404Fallback()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
})
