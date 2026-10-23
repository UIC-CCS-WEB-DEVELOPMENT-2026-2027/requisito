import process from 'node:process'
import { loadConfig } from './config.js'
import { openDatabase } from './db/openDatabase.js'
import { createApp } from './app.js'

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
