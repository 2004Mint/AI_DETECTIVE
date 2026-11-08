/**
 * AI 造梦事务所 · 站点文案参数
 *
 * 这几项会直接显示在页面上（首页标题 / 副标题、页脚署名与说明）。
 * 后台 `/admin` 的「站点参数」可以可视化修改并导出本文件。
 */
import type { DreamSiteConfig } from '@/types/dream'

export const DREAM_SITE: DreamSiteConfig = {
  title: 'AI 造梦事务所',
  subtitle: '让每一个奇思妙想，都有机会被 AI 实现。',
  footerOrg: '重庆外语外事学院 · 人工智能学生研讨与实践社',
  footerNote: '投票仅保存在本机浏览器',
}
