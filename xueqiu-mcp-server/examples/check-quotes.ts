import { XueqiuClient } from '../src/xueqiu/client.ts'
import { loadConfig } from '../src/config.ts'

async function main() {
  const cfg = loadConfig()
  const client = new XueqiuClient(cfg.cookies)
  const data = await client.realtimeQuotes(['SH600519', 'SZ000001'])
  console.log(JSON.stringify(data, null, 2))
}

main()
