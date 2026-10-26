import { readFileSync } from 'node:fs'
import { assessFirstJobRelease } from './first-job-release.mjs'

const root = new URL('../', import.meta.url)
const readJson = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'))
const assessment = assessFirstJobRelease({
  goals: readJson('src/data/goals.json'),
  requirements: readJson('src/data/requirements.json'),
  sources: readJson('src/data/requirementSources.json'),
  evidence: readJson('src/data/firstJobEvidence.json'),
  locales: ['en', 'fil', 'ceb'].map((language) => readJson(`src/i18n/${language}.json`)),
})

console.log(JSON.stringify(assessment, null, 2))
if (assessment.result !== 'PASS') process.exitCode = 1
