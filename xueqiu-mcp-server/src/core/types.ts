/**
 * 统一类型出口：集中对外导出类型，避免重复声明。
 * 注意：XueqiuCookies 的唯一定义在 config.ts，此处仅做 re-export。
 */
export type { XueqiuCookies } from '../config.js'

/**
 * MCP 工具结构化返回的外层类型（辅助说明用）。
 * 工具实现保持返回形如 { raw: any } 的结构化内容。
 */
export type ToolStructured<T> = { raw: T }
