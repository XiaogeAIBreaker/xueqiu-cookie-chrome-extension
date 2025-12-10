export type XueqiuCookies = {
  xq_a_token: string
}

export type AppConfig = {
  cookies?: XueqiuCookies
}

export function loadConfig(): AppConfig {
  const envCookies: XueqiuCookies | undefined = process.env.XQ_A_TOKEN
    ? { xq_a_token: process.env.XQ_A_TOKEN || '' }
    : undefined
  return { cookies: envCookies }
}
