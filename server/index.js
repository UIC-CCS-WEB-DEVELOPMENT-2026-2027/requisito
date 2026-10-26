import process from 'node:process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadConfig } from './config.js'
import { openDatabase } from './db/openDatabase.js'
import { createApp } from './app.js'

export function startServer() {
  const config = loadConfig()
  const db = openDatabase(config.databasePath)
  const app = createApp({ db, config })
  const server = app.listen(config.port, '127.0.0.1', () => {
    console.log(`Admin API listening on http://127.0.0.1:${config.port}`)
  })

  function close() {
    server.close(() => {
      db.close()
      process.exit(0)
    })
  }

  process.on('SIGINT', close)
  process.on('SIGTERM', close)
  return { app, db, server }
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null
if (import.meta.url === invokedPath) startServer()
