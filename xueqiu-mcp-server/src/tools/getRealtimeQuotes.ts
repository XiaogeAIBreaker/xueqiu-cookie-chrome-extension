import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取实时行情（批量）
 * 对应雪球 realtime/quotec 接口，传入 symbols 逗号拼接。
 */

export const getRealtimeQuotesInput = z.object({ symbols: z.array(z.string()).min(1) })
export const getRealtimeQuotesOutput = z.object({ raw: z.any() })

export function createGetRealtimeQuotesTool(client: XueqiuClient) {
  return async (args: any) => {
    const symbols = (args?.symbols as string[]) || []
    const data = await client.realtimeQuotes(symbols)
    return { raw: data }
  }
}
