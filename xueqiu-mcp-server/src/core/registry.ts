import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'

/**
 * 统一工具注册辅助：保证所有工具注册形式一致，减少样板代码。
 * 不改变业务逻辑，仅封装返回结构形态。
 */
export function registerStructuredTool(
  mcp: McpServer,
  name: string,
  desc: string,
  inputSchema: any,
  outputSchema: any,
  run: (args: any) => Promise<any>
) {
  mcp.registerTool(name, { description: desc, inputSchema, outputSchema }, async (args: any) => {
    const data = await run(args)
    return { content: [], structuredContent: data }
  })
}
