## 明确边界
- Chrome 插件仅用于提取 Cookie；不与 MCP 服务耦合。
- MCP 是独立 Node/TS 服务，只依赖雪球 Cookie 完成鉴权与访问接口。
- 开发风格、工程结构对齐本机参考 `/Users/bytedance/Desktop/mcp/packages/server-larkoffice`。

## 与 server-larkoffice 对齐
- 目录与启动：`src/server.ts` 作为 MCP 入口，统一注册工具/资源；沿用同样的启动/关闭钩子与日志。
- 配置加载：沿用该模板的 `config` 读取策略（优先 ENV，其次本地文件），新增 `XQ_A_TOKEN`、`XQ_R_TOKEN`、`XUEQIU_U`、`DEVICE_ID`。
- 工具定义方式：复用其工具注册范式（统一 schema、入参/出参校验、错误包裹），仅替换具体执行逻辑为雪球。
- 打包与发布：对齐 tsconfig、lint、测试框架与构建脚本；产出 `dist/server.js`。

## 工具列表（首版）
- `ping()`：健康检查；返回服务/鉴权状态。
- `updateCookies(cookies)`：运行时更新 Cookie（只存内存，不落盘）。支持两种格式：
  - 原始 `Cookie` 头串（`xq_a_token=...; xq_r_token=...; u=...; device_id=...`）
  - 结构化 JSON `{ xq_a_token, xq_r_token, u, device_id }`
- `getRealtimeQuotes(symbols: string[])`：实时行情列表；拼接雪球 `realtime/quote` 或 `quote/list`。
- `getKline(symbol, period, begin, count, adjust?)`：K 线；`v5/stock/chart/kline.json`（period: `1m/5m/1d/1w/1mo`）。
- `searchSymbols(query, count?)`：模糊搜索；`query/v1/suggest.json` 或筛选器接口。
- `getWatchlist(category?)`：自选股列表；`v5/stock/portfolio/stock/list.json`。

## HTTP 客户端
- 统一封装 `src/xueqiu/client.ts`：
  - 头部：`User-Agent`、`Referer: https://xueqiu.com/`、`Origin`、`Accept`、`Cookie`。
  - 拦截器：401/403（提示更新 Cookie）、429（指数退避重试）、5xx（有限次重试）。
  - 限速：简单令牌桶，避免触发风控。

## 与 pysnowball 的接口映射
- 设计与入参对齐 pysnowball 常用方法（需自取 Token）[gitee.com/wanghuan1989/pysnowball](https://gitee.com/wanghuan1989/pysnowball)：
  - `quote` → `getRealtimeQuotes`
  - `kline` → `getKline`
  - `search` → `searchSymbols`
  - `portfolio`/`favor_list` → `getWatchlist`

## 配置与安全
- 支持 `.env` 与 `~/.xueqiu/cookies.json`；默认不读取 Chrome 插件内部存储，由用户粘贴/导入。
- 日志脱敏；拒绝写入真实 Cookie 文件；仅内存持有。

## 资源/缓存
- 轻量缓存最近行情（TTL 1–5s）与 K 线（TTL 30–60s）；暴露 MCP `resources` 便于上下文复用。

## 测试与验证
- 单元测试覆盖 endpoints 的参数/响应；录制 fixtures（剔除 Cookie）。
- 集成示例：`examples/check-quotes.ts`、`examples/check-kline.ts`；从 `.env` 或 `cookies.json` 加载，快速验证。
- 本地运行与接入：对齐 server-larkoffice 的 MCP 客户端配置（给出片段）。

## 交付物
- 完整 Node/TS 代码、`package.json`、`README.md`、`.env.example`、`cookies.example.json`。
- 首版工具：`ping`、`updateCookies`、`getRealtimeQuotes`、`getKline`、`searchSymbols`、`getWatchlist`。

## 后续扩展
- 按需增加：资金流向、财务指标、资讯；写操作默认不开放，需另行合规评估。