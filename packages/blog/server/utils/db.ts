// packages\blog\server\utils\db.ts
import knex from 'knex'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

let dbInstance: ReturnType<typeof knex> | null = null

export default async function getDb() {
  if (!dbInstance) {
    // 获取绝对路径
    const knexfilePath = resolve(process.cwd(), 'knexfile.js')

    // 转换为 file:// URL
    const knexfileUrl = pathToFileURL(knexfilePath).href

    // 动态导入
    const configModule = await import(knexfileUrl)
    const config = configModule.default || configModule

    dbInstance = knex(config)
  }
  return dbInstance
}
