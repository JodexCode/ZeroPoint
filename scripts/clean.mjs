// scripts/clean.mjs
import { rimraf } from 'rimraf'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const paths = [
  'node_modules',
  'packages/blog/node_modules',
  'packages/admin/node_modules',
  'packages/blog/.nuxt', // 👈 新增：Nuxt 构建输出目录
  '.pnpm-debug.log',
  // 可选：如果你将来有更多缓存，也可以加下面这些
  // 'packages/admin/dist',
  // '.vite',
  // 'pnpm-lock.yaml', // 通常不删 lockfile，除非特殊需求
]

async function clean() {
  for (const relPath of paths) {
    const absPath = join(__dirname, '..', relPath)
    try {
      await rimraf(absPath)
      console.log(`✅ Removed: ${relPath}`)
    } catch (err) {
      // 忽略“路径不存在”错误（ENOENT），其他错误才抛出
      if (err.code !== 'ENOENT') {
        console.error(`❌ Failed to remove: ${relPath}`, err)
        process.exit(1)
      }
      console.log(`⚠️  Skipped (not found): ${relPath}`)
    }
  }
}

await clean()
