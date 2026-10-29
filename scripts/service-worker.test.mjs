import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { routeManifest } from '../src/routeManifest.js'

const viteConfig = await readFile(new URL('../vite.config.js', import.meta.url), 'utf8')
const appEntry = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8')
const appStyles = await readFile(new URL('../src/App.css', import.meta.url), 'utf8')
const indexHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8')
const robotsTxt = await readFile(new URL('../public/robots.txt', import.meta.url), 'utf8')

test('production build emits a versioned worker that precaches the app shell and offline page', () => {
  assert.match(viteConfig, /name: 'requisito-pwa-service-worker'/)
  assert.match(viteConfig, /const version = buildHash\.digest\('hex'\)\.slice\(0, 12\)/)
  assert.match(viteConfig, /cache\.addAll\(PRECACHE_URLS\)/)
  assert.match(viteConfig, /'\/offline\.html'/)
  assert.match(viteConfig, /self\.skipWaiting\(\)/)
  assert.match(viteConfig, /self\.clients\.claim\(\)/)
  assert.match(viteConfig, /fileName: 'sw\.js'/)
})

test('service worker limits caching to safe same-origin GETs and serves offline navigation fallback', () => {
  assert.match(viteConfig, /request\.method !== 'GET'/)
  assert.match(viteConfig, /url\.origin !== self\.location\.origin/)
  assert.match(viteConfig, /url\.pathname\.startsWith\('\/api\/'\)/)
  assert.match(viteConfig, /url\.pathname\.startsWith\('\/admin'\)/)
  assert.match(viteConfig, /cache\.match\('\/offline\.html'\)/)
})

test('production app registers the service worker and checks for updates on focus or reconnection', () => {
  assert.match(appEntry, /register\('\/sw\.js'\)/)
  assert.match(appEntry, /registration\.update\(\)/)
  assert.match(appEntry, /addEventListener\('focus', checkForUpdates\)/)
  assert.match(appEntry, /addEventListener\('online', checkForUpdates\)/)
})

test('mobile hotline marquee pauses on hover/focus and respects reduced-motion preference', () => {
  assert.match(appStyles, /@media \(max-width: 48rem\)[\s\S]*?animation: hotline-marquee/)
  assert.match(appStyles, /\.hotline-ticker:hover ul,[\s\S]*?\.hotline-ticker:focus-within ul/)
  assert.match(appStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?animation: none/)
})

test('public SEO metadata and build-generated sitemap use the public route manifest', () => {
  assert.match(indexHtml, /property="og:title"/)
  assert.match(indexHtml, /property="og:description"/)
  assert.match(indexHtml, /"@type": "WebSite"/)
  assert.match(indexHtml, /"@type": "SearchAction"/)
  assert.match(robotsTxt, /Disallow: \/admin\//)
  assert.match(robotsTxt, /Disallow: \/api\//)
  assert.match(robotsTxt, /Sitemap: https:\/\/requisito\.vercel\.app\/sitemap\.xml/)
  assert.match(viteConfig, /routeManifest/)
  assert.match(viteConfig, /\.filter\(\(route\)/)
  assert.match(viteConfig, /'forbidden', 'serverError'/)
  assert.match(viteConfig, /fileName: 'sitemap\.xml'/)
  assert.equal(routeManifest.find((route) => route.id === 'live')?.path, '/live')
  assert.equal(routeManifest.find((route) => route.id === 'statistics')?.path, '/statistics')
})
