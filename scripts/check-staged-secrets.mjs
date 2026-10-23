import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

// Compare in memory; neither matching values nor matching diff lines are printed.
const envPath = new URL('../.env', import.meta.url)
const stagedOnly = process.argv.includes('--staged-only')
const env = !stagedOnly && existsSync(envPath) ? readFileSync(envPath, 'utf8') : ''
const keys = (env.match(/^AI_API_KEYS=(.*)$/m)?.[1] ?? '').split(',').map(key => key.trim()).filter(Boolean)
const diff = execFileSync('git', ['diff', '--cached', '--no-ext-diff'], { encoding: 'utf8' })
const files = execFileSync('git', ['diff', '--cached', '--name-only'], { encoding: 'utf8' }).split('\n')
const realKey = keys.some(key => diff.includes(key))
const genericKey = /(?:AIza[\w-]{20,}|sk-[\w-]{20,}|AQ\.[\w-]{20,})/.test(diff)
const secretFile = files.some(file => /(^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith('.env.example'))
console.log(realKey || genericKey || secretFile ? 'FAIL: possible staged secret; commit blocked.' :
  stagedOnly ? 'PASS: staged key-pattern scan (no .env access).' : 'PASS: staged secret scan.')
process.exitCode = realKey || genericKey || secretFile ? 1 : 0
