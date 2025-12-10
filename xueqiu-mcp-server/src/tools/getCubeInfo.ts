import { z } from 'zod'
import { XueqiuClient } from '../xueqiu/client.js'

/**
 * 获取组合（Cube）信息
 * 需有效 Cookie，返回组合持仓/净值等信息。
 */

export const getCubeInfoInput = z.object({ cubeSymbol: z.string() })
export const getCubeInfoOutput = z.object({ raw: z.any() })

export function createGetCubeInfoTool(client: XueqiuClient) {
  return async (args: any) => {
    const { cubeSymbol } = args
    const data = await client.cubeInfo(cubeSymbol)
    return { raw: data }
  }
}
