import fs from 'node:fs'
import path from 'node:path'
const root = process.cwd()
let ok = true
function fail(m){ console.error(`✗ ${m}`); ok=false }
function pass(m){ console.log(`✓ ${m}`) }
for (const [rel,tokens] of [
  ['src/shared/components/AppErrorBoundary.tsx',['AppErrorBoundary','frontend.runtime_error','Обновить страницу','Что-то пошло не так']],
  ['src/main.tsx',['AppErrorBoundary','<AppErrorBoundary>']]
]) {
  const file=path.join(root,rel)
  if (!fs.existsSync(file)) { fail(`${rel} missing`); continue }
  const source=fs.readFileSync(file,'utf8')
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${rel} missing ${token}`)
    else pass(`${rel} contains ${token}`)
  }
}
if (!ok) process.exit(1)
console.log('Stage 6 error boundary checks passed.')
