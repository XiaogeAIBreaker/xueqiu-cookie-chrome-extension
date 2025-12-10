import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取资金成交分布
 * 返回大单/中单/小单买卖额与时间戳等。
 */

export const getCapitalAssortInput = z.object({ symbol: z.string() })
export const getCapitalAssortOutput = z.object({ raw: z.any() })

export function createGetCapitalAssortTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol } = args
    const data = await client.capitalAssort(symbol)
    return { raw: data }
  }
}
