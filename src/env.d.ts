/// <reference types="vite/client" />

/**
 * 构建期可用的自定义环境变量（见 vite.config.ts 的 base）
 */
interface ImportMetaEnv {
  /** 资源基础路径：'/' 或 '/仓库名/' 或 './' */
  readonly BASE_URL: string
  /** 共享投票后端：留空=本机，`self`=同源自托管，或完整 URL */
  readonly VITE_VOTE_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
