## 当前覆盖（我们的 Node MCP）
- 实时行情：`getRealtimeQuotes`（注册见 xueqiu-mcp-server/src/server.ts:45）
- K 线数据：`getKline`（注册见 xueqiu-mcp-server/src/server.ts:52）
- 搜索标的：`searchSymbols`（注册见 xueqiu-mcp-server/src/server.ts:59）
- 自选列表：`getWatchlist`（注册见 xueqiu-mcp-server/src/server.ts:66）
- 鉴权/健康：`updateCookies`、`ping`（注册见 xueqiu-mcp-server/src/server.ts:35、28）

## pysnowball 常见能力（公开资料参考）
- Token 设置与鉴权（我们已支持以 Cookie 注入）
- 行情与 K 线（已覆盖）
- 分时/分钟线（`minute`/`timeline`）
- 资金相关：资金成交分布（`capital_assort`）、资金流向等
- 组合（Cube）信息/构成
- 搜索/筛选（已覆盖）
- 自选/组合列表（已覆盖自选）
- 财务与公司概况（可选）

参考：pysnowball README 与示例接口（如资金成交分布）说明 [gitee.com/wanghuan1989/pysnowball](https://gitee.com/wanghuan1989/pysnowball)；资金成交分布示例（`capital_assort`）见 CSDN 文章片段（用于识别类别）[blog.csdn.net/weixin_39752800/article/details/110696240](https://blog.csdn.net/weixin_39752800/article/details/110696240)。

## 与本地 xueqiu_mcp 的对齐假设
- 基本只读能力（行情、K 线、搜索、自选）应一致；
- 可能额外提供分时线、资金分布、Cube 信息等；
- 我们将逐项补齐以达到功能等价。

## 拟补齐的工具（首批）
1. `getMinuteTimeline(symbol: string, begin?: number, count?: number)`：分钟/分时数据（`/v5/stock/chart/minute.json` 或对应接口）
2. `getCapitalAssort(symbol: string)`：资金成交分布（资金类别与占比）
3. `getCubeInfo(cubeSymbol: string)`：组合信息（持仓、净值、回撤等，若接口可用）
4. `getQuoteSnapshot(symbols: string[])`：快照/详细报价（补充与 `realtime/quotec` 的差异）

## 可选扩展（第二批）
- `getFinanceIndicators(symbol: string)`：财务/指标（盈利能力、成长性等）
- `getTradingCalendar(market: string, year?: number)`：交易日历与交易状态
- 港/美股兼容：在现有工具中扩展 `symbol` 识别与接口选择

## 实施方式
- 在 `src/xueqiu/endpoints.ts` 或现有 `client.ts` 中补充对应 HTTP 包装；沿用统一头与 Cookie 注入（见 xueqiu-mcp-server/src/xueqiu/client.ts）。
- 在 `src/tools/` 下新增对应工具文件，参数/返回值用 `zod` 校验；在 `src/server.ts` 注册。
- 轻量缓存：分钟/分时 TTL 5–10s，资金分布 TTL 60–300s。
- 错误处理：401/403 提示更新 Cookie；429/5xx 重试策略与现有一致。

## 验证与交付
- 增加 `examples/check-minute.js`、`examples/check-capital.js` 示例脚本；
- 更新 README 的工具列表与调用示例；
- 本地通过环境变量或 `updateCookies` 注入，逐一验证接口可用。