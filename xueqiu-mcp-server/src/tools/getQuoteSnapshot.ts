import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取行情快照详情
 * 与实时行情互补，提供更详细的报价字段。
 */

export const getQuoteSnapshotInput = z.object({ symbols: z.array(z.string()).min(1) })
export const getQuoteSnapshotOutput = z.object({ raw: z.any() })

export function createGetQuoteSnapshotTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbols } = args
    const data = await client.quoteSnapshot(symbols)
    return { raw: data }
  }
}
