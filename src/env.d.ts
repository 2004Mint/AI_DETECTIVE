/// <reference types="vite/client" />

/**
 * 构建期可用的自定义环境变量（见 vite.config.ts 的 base）
 */
interface ImportMetaEnv {
  /** 资源基础路径：'/' 或 '/仓库名/' 或 './' */
  readonly BASE_URL: string
  /** 可选的共享投票后端地址（留空 = 纯本机投票） */
  readonly VITE_VOTE_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
