import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 模糊搜索标的
 * 对应 suggest 接口，q 为查询词，count 为返回数量上限。
 */

export const searchSymbolsInput = z.object({ query: z.string(), count: z.number().optional() })
export const searchSymbolsOutput = z.object({ raw: z.any() })

export function createSearchSymbolsTool(client: XueqiuClient) {
  return async (args: any) => {
    const q = String(args?.query || '')
    const count = Number(args?.count || 10)
    const data = await client.search(q, count)
    return { raw: data }
  }
}
