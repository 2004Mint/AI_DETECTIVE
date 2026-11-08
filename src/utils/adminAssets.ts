/**
 * 后台 · 素材处理
 *
 * 上传的图片先在前端压成 WebP（限制最长边 1600px），
 * 这样导出的 ZIP 不会因为手机原图（3–8MB）变得巨大。
 */

const MAX_EDGE = 1600
const QUALITY = 0.86

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片读取失败，请换一张试试'))
    }
    image.src = url
  })
}

/** 压缩图片为 WebP；失败时回退原文件 */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('请选择图片文件（jpg / png / webp）')
  try {
    const image = await loadImage(file)
    const width = image.naturalWidth
    const height = image.naturalHeight
    if (!width || !height) return file

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
    const targetWidth = Math.max(1, Math.round(width * scale))
    const targetHeight = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const context = canvas.getContext('2d')
    if (!context) return file
    context.drawImage(image, 0, 0, targetWidth, targetHeight)

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/webp', QUALITY)
    })
    return blob ?? file
  } catch {
    return file
  }
}

/** 取文件扩展名（小写，不含点） */
export function extensionOf(file: File): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : ''
  if (fromName) return fromName.toLowerCase()
  const fromType = file.type.split('/').pop()
  return fromType ? fromType.toLowerCase() : 'bin'
}

/** 人类可读体积 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
