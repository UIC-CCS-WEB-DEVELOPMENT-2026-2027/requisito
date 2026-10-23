import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const watchlistPath = resolve(root, 'data/watchlist.json')
const statePath = resolve(root, 'data/source-watch-state.json')
const reportPath = resolve(root, 'docs/source-watch-report.md')

export function hashText(text) {
  return createHash('sha256').update(text).digest('hex')
}

export function stripPageMarkup(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function compareHashes(watchlist, previousEntries, fetchedEntries) {
  return watchlist.map((item) => {
    const current = fetchedEntries[item.url]
    const previous = previousEntries[item.url]
    const status = !current ? 'unreachable' : !previous ? 'changed' :
      current.hash === previous.hash ? 'unchanged' : 'changed'
    return { ...item, status, hash: current?.hash ?? previous?.hash ?? null }
  })
}

export function validateWatchlist(watchlist) {
  const ids = new Set()
  const urls = new Set()
  for (const item of watchlist) {
    let parsed
    try { parsed = new URL(item.url) } catch { parsed = null }
    if (!item.id || !item.label || !parsed || parsed.protocol !== 'https:' ||
        !parsed.hostname.toLowerCase().endsWith('.gov.ph') || parsed.username || parsed.password) {
      throw new Error('Watchlist entries must have an id and label and use HTTPS .gov.ph URLs.')
    }
    if (ids.has(item.id) || urls.has(item.url)) throw new Error('Watchlist ids and URLs must be unique.')
    ids.add(item.id)
    urls.add(item.url)
  }
}

function parseTimeout(args) {
  const index = args.indexOf('--timeout')
  if (index < 0) return 10000
  const seconds = Number(args[index + 1])
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('--timeout must be a positive number of seconds.')
  return Math.round(seconds * 1000)
}

function escapeMarkdown(value) {
  return value.replace(/[|]/g, '\\|')
}

function citedRecords(url, catalogs) {
  return Object.entries(catalogs).flatMap(([catalog, records]) => records
    .filter((record) => record.sourceUrl === url || record.relatedSources?.includes(url))
    .map((record) => `${catalog} (${record.id}, ${record.slug ?? 'no slug'}): ${record.title ?? record.label ?? record.id}`))
}

async function main(args) {
  const watchlist = JSON.parse(await readFile(watchlistPath, 'utf8'))
  const previous = JSON.parse(await readFile(statePath, 'utf8'))
  validateWatchlist(watchlist)
  if (args.includes('--dry-run')) {
    console.log(`Dry run: ${watchlist.length} URLs would be fetched; no network requests made.`)
    for (const item of watchlist) console.log(`${item.label}: ${item.url}`)
    return
  }
  const timeout = parseTimeout(args)
  const fetched = {}
  for (const item of watchlist) {
    try {
      const response = await fetch(item.url, {
        headers: { 'User-Agent': 'RequisitoStudentProject-SourceWatch' },
        redirect: 'error',
        signal: AbortSignal.timeout(timeout),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const content = stripPageMarkup(await response.text())
      fetched[item.url] = { hash: hashText(content) }
    } catch {
      fetched[item.url] = null
    }
    await delay(1000)
  }
  const results = compareHashes(watchlist, previous.entries, fetched)
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  const catalogs = Object.fromEntries(['services', 'barangays', 'officials', 'cityFacts', 'updates', 'requirements',
    'history', 'briefs', 'budget', 'procurement', 'elections', 'accountability']
    .map((name) => [name, JSON.parse(requireCatalog(name))]))
  const lines = [`# Source watch report`, '', `Last checked: ${today}`, '',
    '| Status | Source | URL | Cited records / action |', '| --- | --- | --- | --- |']
  for (const result of results) {
    const records = citedRecords(result.url, catalogs)
    const action = result.status === 'changed'
      ? `Re-verify: ${records.join('; ') || 'No catalog record found.'}`
      : result.status === 'unreachable' ? 'Retry later; source could not be fetched.' : 'No change detected.'
    lines.push(`| ${result.status} | ${escapeMarkdown(result.label)} | ${escapeMarkdown(result.url)} | ${escapeMarkdown(action)} |`)
  }
  const nextEntries = { ...previous.entries }
  for (const result of results) {
    nextEntries[result.url] = {
      ...(result.hash ? { hash: result.hash } : {}),
      status: result.status,
    }
  }
  const state = { lastChecked: today, entries: nextEntries }
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`)
  await writeFile(reportPath, `${lines.join('\n')}\n`)
  console.log(`Source watch checked ${results.length} URLs. Report: docs/source-watch-report.md`)
}

function requireCatalog(name) {
  return readFileSync(resolve(root, `src/data/${name}.json`), 'utf8')
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await main(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
