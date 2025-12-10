import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取分钟/分时数据
 * 若当前窗口无交易数据，返回 items_size 为 0 属于正常情况。
 */

export const getMinuteTimelineInput = z.object({ symbol: z.string(), begin: z.number().optional(), count: z.number().optional() })
export const getMinuteTimelineOutput = z.object({ raw: z.any() })

export function createGetMinuteTimelineTool(client: XueqiuClient) {
  return async (args: any) => {
    const { symbol, begin, count } = args
    const data = await client.minuteTimeline({ symbol, begin, count })
    return { raw: data }
  }
}
