import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
let ok = true

function fail(message) {
  console.error(`✗ ${message}`)
  ok = false
}

function pass(message) {
  console.log(`✓ ${message}`)
}

const app = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8')
if (!app.includes('useBrowserRoute')) fail('App.tsx must use browser route compatibility layer')
else pass('App.tsx uses browser route compatibility layer')

if (!app.includes('history.replaceState') || !app.includes('#/configurator')) {
  fail('App.tsx must redirect old #/configurator links to /configurator')
} else {
  pass('old #/configurator links are redirected')
}

const vercelPath = path.join(root, 'vercel.json')
if (!fs.existsSync(vercelPath)) {
  fail('vercel.json is missing')
} else {
  const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'))
  const rewrites = vercel.rewrites ?? []
  const hasConfiguratorRewrite = rewrites.some((rule) => rule.source === '/configurator' && rule.destination === '/index.html')
  const hasNestedRewrite = rewrites.some((rule) => String(rule.source).includes('/configurator/') && rule.destination === '/index.html')
  if (!hasConfiguratorRewrite) fail('vercel.json missing /configurator rewrite')
  else pass('vercel.json has /configurator rewrite')
  if (!hasNestedRewrite) fail('vercel.json missing nested /configurator rewrite')
  else pass('vercel.json has nested /configurator rewrite')
}

const activeFiles = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const parts = path.relative(root, full).split(path.sep)
    if (parts.some((part) => ['node_modules', 'dist', 'docs'].includes(part))) continue
    if (entry.isDirectory()) walk(full)
    else if (['.ts', '.tsx', '.js', '.mjs', '.html'].includes(path.extname(full))) activeFiles.push(full)
  }
}
walk(root)

const offenders = activeFiles
  .filter((file) => path.relative(root, file) !== 'src/App.tsx' && path.relative(root, file) !== 'scripts/check-normal-urls.mjs')
  .filter((file) => fs.readFileSync(file, 'utf8').includes('#/configurator'))

if (offenders.length) {
  for (const file of offenders) fail(`active source still contains #/configurator: ${path.relative(root, file)}`)
} else {
  pass('active source has no #/configurator links outside App compatibility layer')
}

if (!ok) process.exit(1)
console.log('Normal URL checks passed.')
