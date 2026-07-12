#!/usr/bin/env node

import { execSync } from 'node:child_process'

export const DEFAULT_DEV_PORTS = [3004, 3005, 3006, 3007, 3008, 3009, 3010, 3011, 3012]

export const ALLOWED_PROCESS_NAMES = new Set([
  'node',
  'node.exe',
  'npm',
  'npm.cmd',
  'npx',
  'npx.cmd',
  'vite',
  'vercel',
  'playwright',
])

export function parsePortCleanArgs(argv = process.argv.slice(2)) {
  const apply = argv.includes('--apply')
  const ports = []
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--port' && argv[index + 1]) {
      ports.push(Number(argv[index + 1]))
      index += 1
    }
  }
  return {
    apply,
    ports: ports.length > 0 ? ports : [...DEFAULT_DEV_PORTS],
  }
}

export function isAllowedProcessName(processName) {
  if (!processName) return false
  const normalized = processName.toLowerCase()
  for (const allowed of ALLOWED_PROCESS_NAMES) {
    const token = allowed.toLowerCase().replace(/\.exe$/, '').replace(/\.cmd$/, '')
    if (normalized === allowed.toLowerCase() || normalized.includes(token)) {
      return true
    }
  }
  return false
}

export function parseNetstatRows(output, ports) {
  const portSet = new Set(ports.map((port) => String(port)))
  const listeners = new Map()

  for (const line of output.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || !trimmed.toLowerCase().includes('listening')) continue

    const parts = trimmed.split(/\s+/)
    if (parts.length < 5) continue

    const localAddress = parts[1] || ''
    const pid = Number(parts[parts.length - 1])
    const portMatch = localAddress.match(/:(\d+)$/)
    if (!portMatch || !portSet.has(portMatch[1]) || !Number.isFinite(pid)) continue

    const port = Number(portMatch[1])
    listeners.set(`${port}:${pid}`, { port, pid })
  }

  return [...listeners.values()]
}

export function buildPortScanRows({ ports, listeners, resolveProcessName }) {
  return ports.flatMap((port) => {
    const matches = listeners.filter((item) => item.port === port)
    if (matches.length === 0) {
      return [{ port, pid: null, processName: null, allowed: false, occupied: false }]
    }

    return matches.map((item) => {
      const processName = resolveProcessName(item.pid)
      const allowed = isAllowedProcessName(processName)
      return {
        port: item.port,
        pid: item.pid,
        processName,
        allowed,
        occupied: true,
      }
    })
  })
}

export function summarizePortScan(rows) {
  const occupied = rows.filter((row) => row.occupied)
  const allowedTargets = occupied.filter((row) => row.allowed)
  return {
    scannedPorts: new Set(rows.map((row) => row.port)).size,
    occupiedCount: occupied.length,
    allowedTargetCount: allowedTargets.length,
    skippedCount: occupied.filter((row) => !row.allowed).length,
    freeCount: rows.filter((row) => !row.occupied).length,
  }
}

export function planPortCleanup(rows, apply) {
  return rows.map((row) => {
    if (!row.occupied || !row.allowed) {
      return { ...row, action: 'skip' }
    }
    return { ...row, action: apply ? 'kill' : 'would-kill' }
  })
}

export function renderPortScanTable(rows) {
  const header = ['Port', 'PID', 'Process', 'Allowed', 'Occupied', 'Action']
  const body = rows.map((row) => [
    String(row.port),
    row.pid ? String(row.pid) : '-',
    row.processName || '-',
    row.allowed ? 'yes' : 'no',
    row.occupied ? 'yes' : 'no',
    row.action || 'skip',
  ])

  const widths = header.map((column, index) =>
    Math.max(column.length, ...body.map((line) => line[index].length)),
  )

  const formatLine = (cells) => cells.map((cell, index) => cell.padEnd(widths[index])).join('  ')
  return [formatLine(header), formatLine(widths.map((width) => '-'.repeat(width))), ...body.map(formatLine)].join('\n')
}

function resolveWindowsProcessName(pid) {
  try {
    const output = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const firstLine = output.split(/\r?\n/).find((line) => line.trim())
    if (!firstLine) return null
    const match = firstLine.match(/^"([^"]+)"/)
    return match?.[1] || null
  } catch {
    return null
  }
}

function listPortListeners(ports) {
  const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' })
  return parseNetstatRows(output, ports)
}

function killProcess(pid) {
  execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' })
}

export function runPortHygiene(options = {}) {
  const { apply = false, ports = DEFAULT_DEV_PORTS } = options
  const listeners = options.listeners || listPortListeners(ports)
  const resolveProcessName = options.resolveProcessName || resolveWindowsProcessName

  const rows = planPortCleanup(
    buildPortScanRows({ ports, listeners, resolveProcessName }),
    apply,
  )
  const summary = summarizePortScan(rows)

  if (apply) {
    for (const row of rows) {
      if (row.action === 'kill' && row.pid) {
        killProcess(row.pid)
      }
    }
  }

  return { rows, summary, apply }
}

function main() {
  const args = parsePortCleanArgs()
  const result = runPortHygiene({ apply: args.apply, ports: args.ports })

  console.log(renderPortScanTable(result.rows))
  console.log('')
  console.log(
    JSON.stringify({
      event: 'dev_ports_hygiene',
      mode: args.apply ? 'apply' : 'dry-run',
      ...result.summary,
    }),
  )

  const actionable = result.rows.filter((row) => row.action === 'kill' || row.action === 'would-kill')
  if (actionable.length === 0) {
    process.exit(0)
  }

  process.exit(0)
}

if (process.argv[1]?.includes('clean-local-dev-ports.mjs')) {
  main()
}
