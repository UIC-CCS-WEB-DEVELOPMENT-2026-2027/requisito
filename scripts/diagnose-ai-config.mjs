import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { getAssistantRecords, verificationOf } from '../netlify/lib/assistant-records.js'
import { isSupportedModelName } from '../netlify/lib/gemini.js'

export function getAssistantConfigStatus(env = process.env, records = getAssistantRecords()) {
  const model = env.AI_MODEL?.trim() ?? ''
  const credentialsConfigured = (env.AI_API_KEYS ?? '')
    .split(/[,\r\n]+/)
    .some(key => key.trim().length > 0)

  return {
    providerConfigured: env.AI_PROVIDER === 'gemini',
    modelPresent: model.length > 0,
    modelFormatAccepted: isSupportedModelName(model),
    credentialsConfigured,
    eligibleVerifiedRecordsExist: records.some(record => verificationOf(record) === 'verified'),
    localFunctionCommand: 'npx vercel dev --listen 3000',
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(getAssistantConfigStatus(), null, 2))
}
