import axios, { AxiosInstance } from 'axios'
import type { XueqiuCookies } from '../config.js'
import { BASE_URL_STOCK, BASE_URL_MAIN, HEADERS_BASE, buildCookieHeader } from '../core/constants.js'

/**
 * 雪球 HTTP 客户端
 * - 统一追加请求头（UA/Referer/Origin）与 Cookie
 * - 指数退避重试：429 与 5xx
 * - 轻量缓存：行情 2s、分钟 10s、K 线 30s、资金/组合 60s、快照 5s
 */

export class XueqiuClient {
  private axios: AxiosInstance
  private cookies?: XueqiuCookies
  private cache = new Map<string, { expire: number; data: any }>()

  constructor(cookies?: XueqiuCookies) {
    this.cookies = cookies
    this.axios = axios.create({ baseURL: BASE_URL_STOCK, timeout: 15000 })
    this.axios.interceptors.request.use((config) => {
      config.headers = config.headers || {}
      ;(config.headers as any)['User-Agent'] = HEADERS_BASE['User-Agent']
      ;(config.headers as any)['Referer'] = HEADERS_BASE['Referer']
      ;(config.headers as any)['Origin'] = HEADERS_BASE['Origin']
      const cookie = buildCookieHeader(this.cookies?.xq_a_token)
      if (cookie) (config.headers as any)['Cookie'] = cookie
      return config
    })
    this.axios.interceptors.response.use(
      (resp) => resp,
      async (err) => {
        const status = err?.response?.status
        if (status === 429 || status >= 500) {
          await new Promise((r) => setTimeout(r, 500))
          return this.axios.request(err.config)
        }
        throw err
      }
    )
  }

  updateCookies(cookies?: XueqiuCookies) {
    this.cookies = cookies
  }

  async realtimeQuotes(symbols: string[]): Promise<any> {
    const query = symbols.join(',')
    const url = `/v5/stock/realtime/quotec.json?symbol=${encodeURIComponent(query)}`
    const key = `quotes:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 2000, data })
    return data
  }

  async kline(params: { symbol: string; period: string; begin: number; count: number; type?: string; indicator?: string }): Promise<any> {
    const { symbol, period, begin, count, type = 'normal', indicator = 'kline,volume' } = params
    const url = `/v5/stock/chart/kline.json?symbol=${encodeURIComponent(symbol)}&period=${encodeURIComponent(period)}&begin=${begin}&count=${count}&type=${type}&indicator=${encodeURIComponent(indicator)}`
    const key = `kline:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 30000, data })
    return data
  }

  async search(query: string, count = 10): Promise<any> {
    const base = `${BASE_URL_MAIN}query/v1/suggest.json`
    const { data } = await this.axios.get(`${base}?q=${encodeURIComponent(query)}&count=${count}`)
    return data
  }

  async watchlist(category = 'stock'): Promise<any> {
    const url = `/v5/stock/portfolio/stock/list.json?category=${encodeURIComponent(category)}`
    const { data } = await this.axios.get(url)
    return data
  }

  async minuteTimeline(params: { symbol: string; begin?: number; count?: number }): Promise<any> {
    const { symbol, begin = Date.now(), count = 120 } = params
    const url = `/v5/stock/chart/minute.json?symbol=${encodeURIComponent(symbol)}&begin=${begin}&count=${count}`
    const key = `minute:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 10000, data })
    return data
  }

  async capitalAssort(symbol: string): Promise<any> {
    const url = `/v5/stock/capital/assort.json?symbol=${encodeURIComponent(symbol)}`
    const key = `capital:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 60000, data })
    return data
  }

  async quoteSnapshot(symbols: string[]): Promise<any> {
    const query = symbols.join(',')
    const url = `/v5/stock/quote.json?symbol=${encodeURIComponent(query)}&extend=detail`
    const key = `snapshot:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 5000, data })
    return data
  }

  async cubeInfo(cubeSymbol: string): Promise<any> {
    const base = `${BASE_URL_MAIN}cubes/show.json`
    const url = `${base}?symbols=${encodeURIComponent(cubeSymbol)}`
    const key = `cube:${url}`
    const now = Date.now()
    const hit = this.cache.get(key)
    if (hit && hit.expire > now) return hit.data
    const { data } = await this.axios.get(url)
    this.cache.set(key, { expire: now + 60000, data })
    return data
  }
}
