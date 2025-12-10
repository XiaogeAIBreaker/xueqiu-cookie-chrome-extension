import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取自选列表
 * category 默认 'stock'；返回当前账户下的自选集合。
 */

export const getWatchlistInput = z.object({ category: z.string().optional() })
export const getWatchlistOutput = z.object({ raw: z.any() })

export function createGetWatchlistTool(client: XueqiuClient) {
  return async (args: any) => {
    const category = String(args?.category || 'stock')
    const data = await client.watchlist(category)
    return { raw: data }
  }
}
