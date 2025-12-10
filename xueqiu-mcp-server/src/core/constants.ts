/**
 * 雪球接口常量与通用请求头构造函数
 * 保持单一数据源，避免在多个文件重复硬编码字符串。
 */
export const BASE_URL_STOCK = 'https://stock.xueqiu.com/'
export const BASE_URL_MAIN = 'https://xueqiu.com/'

/**
 * 构造统一的请求头（不含 Cookie）。
 * Cookie 由调用方按需追加，避免在多处散落。
 */
export const HEADERS_BASE = {
  'User-Agent': 'Mozilla/5.0',
  Referer: BASE_URL_MAIN,
  Origin: BASE_URL_MAIN
}

/**
 * 根据 xq_a_token 构造 Cookie 字符串。
 */
export function buildCookieHeader(xq_a_token?: string): string | undefined {
  if (!xq_a_token) return undefined
  return `xq_a_token=${xq_a_token}`
}
