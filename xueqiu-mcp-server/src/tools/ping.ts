import { z } from 'zod'

/**
 * 健康检查工具：返回服务状态与鉴权状态。
 */
export const pingInput = z.object({})
export const pingOutput = z.object({ status: z.string(), auth: z.boolean() })

export function createPingTool(hasAuth: () => boolean) {
  return async () => ({ status: 'ok', auth: hasAuth() })
}
