import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const envPath = path.join(rootDir, '.env')
const examplePath = path.join(rootDir, '.env.example')
const frontendDir = path.join(rootDir, 'food-rescue-platform')
const outPath = path.join(frontendDir, '.env.local')

function readFileIfExists(p) {
  try { return fs.readFileSync(p, 'utf8') } catch { return null }
}

const sourceContent = readFileIfExists(envPath) ?? readFileIfExists(examplePath)
if (!sourceContent) {
  console.error(`[env-sync] No .env or .env.example found at ${rootDir}`)
  process.exit(1)
}

const viteLines = []
for (const raw of sourceContent.split(/\r?\n/)) {
  const line = raw.trim()
  if (!line || line.startsWith('#')) continue
  const m = line.match(/^\s*(?:export\s+)?(VITE_[A-Z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) viteLines.push(`${m[1]}=${m[2]}`)
}

const header = [
  '# This file is generated. Do not edit.',
  '# Run: node ../scripts/env-sync.mjs',
  `# Source: ${fs.existsSync(envPath) ? '.env' : '.env.example'}`,
]

const body = viteLines.length ? viteLines.join('\n') + '\n' : ''
const output = header.join('\n') + '\n\n' + body

fs.writeFileSync(outPath, output.replace(/\n/g, '\r\n'), 'utf8')

if (!viteLines.length) {
  console.warn('[env-sync] No VITE_* variables found in source. .env.local contains only header.')
} else {
  console.log(`[env-sync] Wrote ${viteLines.length} VITE_* key(s) to food-rescue-platform/.env.local`)
}