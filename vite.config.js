import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHash } from 'node:crypto'

function pwaServiceWorker() {
  return {
    name: 'requisito-pwa-service-worker',
    apply: 'build',
    generateBundle(_outputOptions, bundle) {
      const shellAssets = new Set()
      function includeShellChunk(fileName) {
        const chunk = bundle[fileName]
        if (!chunk || chunk.type !== 'chunk' || shellAssets.has(fileName)) return
        shellAssets.add(fileName)
        for (const cssFile of chunk.viteMetadata?.importedCss ?? []) shellAssets.add(cssFile)
        for (const importedFile of chunk.imports) includeShellChunk(importedFile)
      }
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk' && chunk.isEntry) includeShellChunk(chunk.fileName)
      }
      const precache = [...new Set([
        '/',
        ...[...shellAssets].map((file) => `/${file}`),
        '/favicon.svg',
        '/icons.svg',
        '/manifest.webmanifest',
        '/offline.html',
      ])]
      const buildHash = createHash('sha256').update(precache.join('\n')).update(String(Date.now()))
      for (const file of Object.keys(bundle).sort()) {
        const source = bundle[file].source
        if (source !== undefined) buildHash.update(file).update(source)
      }
      const version = buildHash.digest('hex').slice(0, 12)
      const source = `
const CACHE_NAME = 'requisito-static-${version}'
const PRECACHE_URLS = ${JSON.stringify(precache)}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('requisito-static-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/admin')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME)
          return await cache.match('/index.html')
            || await cache.match('/')
            || await cache.match('/offline.html')
        }),
    )
    return
  }

  if (['font', 'image', 'manifest', 'script', 'style', 'worker'].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const response = await fetch(request)
        if (response.ok && response.type === 'basic') await cache.put(request, response.clone())
        return response
      }),
    )
  }
})
`
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

export default defineConfig({
  plugins: [react(), pwaServiceWorker()],
  build: {
    rolldownOptions: {
      output: {
        // Cache framework and translations independently of changing civic data.
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /node_modules/ },
            { name: 'translations', test: /src\/i18n\/.*\.json$/ },
          ],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
})
