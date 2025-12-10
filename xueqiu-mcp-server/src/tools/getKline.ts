import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取 K 线数据
 * period 支持 1m/5m/1d/1w/1mo，begin 为毫秒时间戳，count 为条数。
 */

export const getKlineInput = z.object({
  symbol: z.string(),
  period: z.string(),
  begin: z.number(),
  count: z.number(),
  adjust: z.string().optional()
})
export const getKlineOutput = z.object({ raw: z.any() })

export function createGetKlineTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, period, begin, count, adjust } = args
    const data = await client.kline({ symbol, period, begin, count, type: adjust || 'normal' })
    return { raw: data }
  }
}
