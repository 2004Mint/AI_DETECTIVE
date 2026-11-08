/**
 * 极简 ZIP 打包（仅「存储」不压缩）
 *
 * 素材本身就是 WebP / MP3，再压缩几乎没有收益，所以不引入 zip 依赖，
 * 手写一个 Store 模式的 ZIP：本地头 + 数据 + 中央目录 + EOCD。
 */

export interface ZipEntry {
  /** zip 内的路径，例如 `works/visual-01.webp` */
  name: string
  data: Uint8Array
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i += 1) {
    let c = i
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c >>> 0
  }
  return table
})()

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) {
    crc = (CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8)) >>> 0
  }
  return (crc ^ 0xffffffff) >>> 0
}

/** DOS 时间格式（ZIP 规范要求） */
function dosDateTime(date: Date): { time: number; date: number } {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((date.getSeconds() & 0x1f) >> 1)
  const day =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f)
  return { time: time & 0xffff, date: day & 0xffff }
}

/** 打包成 ZIP Blob */
export function createZip(entries: readonly ZipEntry[], date = new Date()): Blob {
  const encoder = new TextEncoder()
  const { time, date: dosDate } = dosDateTime(date)
  const parts: BlobPart[] = []
  const central: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length

    const local = new Uint8Array(30 + nameBytes.length)
    const localView = new DataView(local.buffer)
    localView.setUint32(0, 0x04034b50, true) // 本地文件头签名
    localView.setUint16(4, 20, true) // 解压所需版本
    localView.setUint16(6, 0x0800, true) // 文件名 UTF-8
    localView.setUint16(8, 0, true) // 压缩方式：store
    localView.setUint16(10, time, true)
    localView.setUint16(12, dosDate, true)
    localView.setUint32(14, crc, true)
    localView.setUint32(18, size, true) // 压缩后大小
    localView.setUint32(22, size, true) // 原始大小
    localView.setUint16(26, nameBytes.length, true)
    localView.setUint16(28, 0, true) // extra 长度
    local.set(nameBytes, 30)

    parts.push(local as BlobPart, entry.data as BlobPart)

    const cd = new Uint8Array(46 + nameBytes.length)
    const cdView = new DataView(cd.buffer)
    cdView.setUint32(0, 0x02014b50, true) // 中央目录签名
    cdView.setUint16(4, 20, true) // 创建版本
    cdView.setUint16(6, 20, true) // 解压所需版本
    cdView.setUint16(8, 0x0800, true)
    cdView.setUint16(10, 0, true)
    cdView.setUint16(12, time, true)
    cdView.setUint16(14, dosDate, true)
    cdView.setUint32(16, crc, true)
    cdView.setUint32(20, size, true)
    cdView.setUint32(24, size, true)
    cdView.setUint16(28, nameBytes.length, true)
    cdView.setUint16(30, 0, true) // extra
    cdView.setUint16(32, 0, true) // comment
    cdView.setUint16(34, 0, true) // disk
    cdView.setUint16(36, 0, true) // internal attrs
    cdView.setUint32(38, 0, true) // external attrs
    cdView.setUint32(42, offset, true) // 本地头偏移
    cd.set(nameBytes, 46)
    central.push(cd)

    offset += local.length + size
  }

  const centralSize = central.reduce((sum, item) => sum + item.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true) // EOCD
  endView.setUint16(4, 0, true)
  endView.setUint16(6, 0, true)
  endView.setUint16(8, entries.length, true)
  endView.setUint16(10, entries.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)
  endView.setUint16(20, 0, true)

  return new Blob([...parts, ...(central as BlobPart[]), end as BlobPart], {
    type: 'application/zip',
  })
}
