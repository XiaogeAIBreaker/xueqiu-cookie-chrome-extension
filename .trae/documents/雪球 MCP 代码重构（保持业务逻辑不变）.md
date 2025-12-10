## 重构原则
- 不修改现有业务行为与对外接口（工具名称、入参与出参结构、HTTP 请求路径与参数保持一致）。
- 单一数据源：配置与 Cookie 类型、HTTP 常量、工具注册入口均只在一个地方声明与维护。
- 清理无用代码与重复代码，保证可维护性与可拓展性。
- 增加必要注释与 JSDoc，解释设计意图、关键约束与易错点。

## 现状梳理与不动点
- 工具：已注册 `ping`、`updateCookies`、`getRealtimeQuotes`、`getKline`、`searchSymbols`、`getWatchlist`、`getMinuteTimeline`、`getCapitalAssort`、`getQuoteSnapshot`、`getCubeInfo`（入口见 xueqiu-mcp-server/src/server.ts）。
- 客户端：统一在 `src/xueqiu/client.ts` 封装，携带 `Cookie: xq_a_token=...`、统一拦截器与轻量缓存；这一行为保持不变。
- 配置：`src/config.ts` 仅保留 `xq_a_token`；保持不变。
- 现有重复/无用：
  - `redact` 未被使用（src/server.ts:26–28）。
  - `logger` 声明但未使用（src/server.ts:17）。
  - 多处硬编码 URL 字符串（client.ts 中搜索与组合接口使用不同域）；可抽为常量但不改变具体值与拼接逻辑。

## 结构化重构方案（不改变逻辑）
### 1. 核心常量与类型集中
- 新增 `src/core/constants.ts`
  - 导出 `BASE_URL_STOCK`、`BASE_URL_MAIN`、通用 `HEADERS_BASE`；`client.ts` 引用，消除多处硬编码。
- 新增（或整合）`src/core/types.ts`
  - 统一导出 `XueqiuCookies`、通用响应类型封装 `ToolStructured<T>`（仅类型）；各工具的 `zod` schema 保持在原文件，按需从此处引类型。

### 2. 工具注册统一辅助
- 保留现有 `registerStructured`（src/server.ts:51–56）；
- 抽取为 `src/core/registry.ts` 的 `registerStructuredTool(server, name, desc, input, output, handler)`，入口仅引用此函数，避免在 `server.ts` 重复同样样板代码；不改变注册顺序与工具名。

### 3. HTTP 客户端内聚
- `src/xueqiu/client.ts`：
  - 使用 `constants.ts` 的常量；
  - 为每个公开方法添加 JSDoc 注释（入参、返回结构、缓存 TTL、可能的错误码 400016/429/5xx 说明）；
  - 保持拦截器与缓存的现有实现；
  - 统一私有 `cacheGet(key, ttl, fetcher)` 辅助以减少重复 TTL 逻辑（不改变 TTL 数值）。

### 4. 入口与工具文件整理
- `src/server.ts`：
  - 移除未使用的 `redact` 与 `logger`（仅删除死代码，不影响业务）。
  - 保持 `McpServer` 与 `StdioServerTransport` 的当前用法；
  - 将每个工具的“为什么需要、如何鉴权、失败时表现”写入注释块（中英文简要）。
- `src/tools/*.ts`：
  - 添加 JSDoc 注释到每个 `create*Tool` 与 `*Input/*Output`，注明对应雪球接口与参数含义；
  - 保持现有 `raw: any` 结构不变。

### 5. 清理与一致性检查
- 删除未引用的变量与函数（`redact`、`logger`）。
- 统一全部相对导入的后缀 `.js`（已完成，逐一检查确保一致）。
- 运行 `npm run build` 验证类型与编译通过。

## 注释与文档
- 在 `client.ts`、`server.ts`、各工具文件添加 JSDoc 与模块级注释：
  - 说明业务背景（仅依赖 `xq_a_token`）、风险与接口限制（部分接口需有效 Cookie，可能返回 400016）。
  - 阐明缓存 TTL 的设计意图与不可随意调整的原因。
  - 对 MCP `structuredContent` 的返回结构做简短说明，避免后续误用。
- README 增补“架构概览”与“错误码说明”小节，不改用法。

## 验证
- 构建：`npm run build`；
- 运行示例：`examples:quotes / minute / capital`，确认输出一致；
- 对比工具注册数量与名称，确保未缺失与未重命名。

## 交付物
- 新增：`src/core/constants.ts`、`src/core/types.ts`、`src/core/registry.ts`；
- 注释：`client.ts`、`server.ts`、`tools/*.ts`；
- 清理：移除未使用的 `redact` 与 `logger`；
- 文档：README 增补说明。

## 风险控制
- 改动均为结构与注释层面；对外工具接口、HTTP 路径与参数、缓存 TTL 均保持不变；
- 如出现编译或行为差异，回滚仅需恢复入口与客户端对常量的直接硬编码引用。