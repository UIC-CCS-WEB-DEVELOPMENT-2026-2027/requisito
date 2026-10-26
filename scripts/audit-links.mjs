import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parse } from 'espree'
import { adminRoutes, routeManifest, routeMatches } from '../src/routeManifest.js'
import { externalHosts } from '../src/externalHosts.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const sourceDirectory = path.join(root, 'src')
const sourceFiles = []
const issues = []

function collectFiles(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) collectFiles(entryPath)
    else if (entry.isFile() && entry.name.endsWith('.jsx')) sourceFiles.push(entryPath)
  }
}

function children(node) {
  return Object.values(node).flatMap((value) => {
    if (Array.isArray(value)) return value.filter((item) => item && typeof item.type === 'string')
    return value && typeof value.type === 'string' ? [value] : []
  })
}

function visit(node, ancestors, callback) {
  if (!node || typeof node.type !== 'string') return
  callback(node, ancestors)
  for (const child of children(node)) visit(child, [...ancestors, node], callback)
}

function tagName(element) {
  const name = element.openingElement.name
  return name.type === 'JSXIdentifier' ? name.name : ''
}

function attribute(element, name) {
  return element.openingElement.attributes.find((item) =>
    item.type === 'JSXAttribute' && item.name.name === name,
  )
}

function staticAttributeValue(item) {
  if (!item) return null
  if (item.value?.type === 'Literal') return String(item.value.value)
  if (item.value?.type === 'JSXExpressionContainer' && item.value.expression.type === 'Literal') {
    return String(item.value.expression.value)
  }
  return null
}

function attributeSignature(item) {
  if (!item) return null
  const value = item.value
  if (value?.type === 'Literal') return `static:${value.value}`
  const expression = value?.type === 'JSXExpressionContainer' ? value.expression : null
  if (expression?.type === 'Identifier') return `expression:${expression.name}`
  if (expression?.type === 'TemplateLiteral') {
    return `template:${expression.quasis.map((part, index) =>
      `${part.value.raw}${index < expression.expressions.length ? '${}' : ''}`,
    ).join('')}`
  }
  return null
}

function routeIdFromExpression(expression) {
  if (expression?.type !== 'CallExpression' ||
      expression.callee.type !== 'Identifier' || expression.callee.name !== 'href') return null
  const firstArgument = expression.arguments[0]
  return firstArgument?.type === 'Literal' ? String(firstArgument.value) : null
}

function templatePath(expression) {
  if (expression?.type !== 'TemplateLiteral') return null
  return expression.quasis.map((part, index) =>
    `${part.value.cooked ?? part.value.raw}${index < expression.expressions.length ? 'sample' : ''}`,
  ).join('')
}

function routeTargetExists(target) {
  if (target === '*') return true
  let pathname
  try {
    pathname = new URL(target, 'https://internal.invalid').pathname
  } catch {
    return false
  }
  if (!pathname.startsWith('/')) return false
  if (routeMatches(pathname)) return true
  return adminRoutes.some((route) => {
    const pattern = `^${route.replace(/:[^/]+/g, '[^/]+').replaceAll('/', '\\/')}/?$`
    return new RegExp(pattern).test(pathname)
  })
}

function report(file, node, message) {
  const relative = path.relative(root, file)
  issues.push(`${relative}:${node.loc.start.line}: ${message}`)
}

collectFiles(sourceDirectory)

for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8')
  let ast
  try {
    ast = parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      loc: true,
      ecmaFeatures: { jsx: true },
    })
  } catch (error) {
    issues.push(`${path.relative(root, file)}: parse error: ${error.message}`)
    continue
  }
  const ids = new Set()
  const labels = new Set()
  const labelWrappedIds = new Set()
  visit(ast, [], (node, ancestors) => {
    if (node.type !== 'JSXElement') return
    const tag = tagName(node)
    const id = attributeSignature(attribute(node, 'id'))
    if (id) ids.add(id)
    const labelFor = attributeSignature(attribute(node, 'htmlFor'))
    if (tag === 'label' && labelFor) labels.add(labelFor)
    if (tag === 'label') {
      visit(node, [], (child) => {
        if (child.type === 'JSXElement') {
          const wrappedId = attributeSignature(attribute(child, 'id'))
          if (wrappedId) labelWrappedIds.add(wrappedId)
        }
      })
    }
  })

  visit(ast, [], (node, ancestors) => {
    if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'href') {
      const id = routeIdFromExpression(node)
      const argument = node.arguments[0]
      const isManifestValue = argument?.type === 'MemberExpression' &&
        argument.object.type === 'Identifier' && argument.object.name === 'route' &&
        argument.property.type === 'Identifier' && argument.property.name === 'id'
      const isMappedId = argument?.type === 'Identifier' && argument.name === 'routeId'
      if ((!id && !isManifestValue && !isMappedId) ||
          (id && !routeManifest.some((route) => route.id === id))) {
        report(file, node, 'href() uses an unknown route id')
      }
    }
    if (node.type !== 'JSXElement') return
    const tag = tagName(node)
    const sourceLine = node.loc.start.line
    const location = `${path.relative(root, file)}:${sourceLine}`

    if (['Link', 'NavLink', 'Navigate'].includes(tag)) {
      const to = attribute(node, 'to')
      const direct = staticAttributeValue(to)
      const expression = to?.value?.type === 'JSXExpressionContainer' ? to.value.expression : null
      const routeId = routeIdFromExpression(expression)
      const template = templatePath(expression)
      if (routeId && !routeManifest.some((route) => route.id === routeId)) {
        report(file, node, `unknown route id "${routeId}"`)
      } else if (direct && direct.startsWith('/') && !routeTargetExists(direct)) {
        report(file, node, `internal link target "${direct}" is not in the route manifest`)
      } else if (template && !routeTargetExists(template)) {
        report(file, node, `dynamic internal link target "${template}" is not in the route manifest`)
      }
    }

    if (tag === 'a') {
      const href = attribute(node, 'href')
      const target = staticAttributeValue(href)
      const expression = href?.value?.type === 'JSXExpressionContainer' ? href.value.expression : null
      if (target?.startsWith('/')) {
        if (!routeTargetExists(target)) report(file, node, `internal anchor target "${target}" is not in the route manifest`)
      } else if (target?.startsWith('#') && !ids.has(`static:${target.slice(1)}`)) {
        report(file, node, `in-page anchor "${target}" has no matching id in this file`)
      } else if (target?.startsWith('http:') || target?.startsWith('https:')) {
        try {
          const url = new URL(target)
          if (url.protocol !== 'https:' || !externalHosts.has(url.hostname.toLowerCase())) {
            report(file, node, `external host "${url.hostname}" is not allowlisted`)
          }
        } catch {
          report(file, node, `invalid external URL "${target}"`)
        }
      } else if (expression && expression.type === 'CallExpression' &&
          expression.callee.type === 'Identifier' &&
          !['safeSourceUrl', 'phoneHref'].includes(expression.callee.name)) {
        report(file, node, 'dynamic anchor destination must use a reviewed link helper')
      }
      if (staticAttributeValue(attribute(node, 'target')) === '_blank') {
        const rel = staticAttributeValue(attribute(node, 'rel')) ?? ''
        if (!rel.split(/\s+/).includes('noopener') || !rel.split(/\s+/).includes('noreferrer')) {
          report(file, node, 'external new-tab link must include noopener noreferrer')
        }
      }
    }

    if (['input', 'select', 'textarea'].includes(tag)) {
      const id = attributeSignature(attribute(node, 'id'))
      const named = attribute(node, 'aria-label') || attribute(node, 'aria-labelledby')
      if (!named && (!id || (!labels.has(id) && !labelWrappedIds.has(id)))) {
        report(file, node, `${tag} needs a visible or programmatic label`)
      }
    }

    if (tag === 'button') {
      if (!attribute(node, 'type')) report(file, node, 'button needs an explicit type')
      const accessible = attribute(node, 'aria-label') || attribute(node, 'title') ||
        node.children.some((child) =>
          child.type === 'JSXText' && child.value.trim() ||
          child.type === 'JSXExpressionContainer' && child.expression.type !== 'JSXEmptyExpression',
        )
      if (!accessible) report(file, node, 'button needs an accessible name')
      const onClick = attribute(node, 'onClick')?.value?.expression
      const handler = onClick?.type === 'JSXEmptyExpression' ? null : onClick
      const body = handler?.body
      if (body?.type === 'BlockStatement' && (
        body.body.length === 0 ||
        body.body.every((statement) => statement.type === 'ExpressionStatement' &&
          statement.expression.type === 'CallExpression' &&
          statement.expression.callee.type === 'MemberExpression' &&
          statement.expression.callee.object.name === 'console' &&
          statement.expression.callee.property.name === 'log')
      )) report(file, node, 'button has an empty or console-only click handler')
    }

    if (tag === 'img' && !attribute(node, 'alt')) report(file, node, 'image needs an alt attribute')
    if (tag === 'a' && !attribute(node, 'href')) report(file, node, 'anchor needs an href')
  })
}

export function auditLinks() {
  return { files: sourceFiles.map((file) => path.relative(root, file)), issues: [...issues] }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(`Scanned ${sourceFiles.length} JSX files against ${routeManifest.length} public routes and ${adminRoutes.length} admin routes.`)
  if (issues.length) {
    for (const issue of issues) console.error(issue)
    console.error(`${issues.length} link/accessibility audit issue(s) found.`)
    process.exitCode = 1
  } else {
    console.log('Link and accessibility audit passed.')
  }
}
