import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

export type ContractRecord = {
  id: number
  client: string
  freelancer: string
  amount: number
  githubUrl: string | null
  validated: boolean
  aiScore: number | null
  txId: string | null
}

const DB_PATH = resolve(process.cwd(), 'backend', 'contracts.json')

function ensureDbFile() {
  const dir = dirname(DB_PATH)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  if (!existsSync(DB_PATH)) writeFileSync(DB_PATH, '[]', 'utf-8')
}

export function loadAll(): ContractRecord[] {
  ensureDbFile()
  const raw = readFileSync(DB_PATH, 'utf-8')
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as ContractRecord[] : []
  } catch {
    return []
  }
}

function saveAll(items: ContractRecord[]) {
  writeFileSync(DB_PATH, JSON.stringify(items, null, 2), 'utf-8')
}

export function getById(id: number): ContractRecord | undefined {
  return loadAll().find(c => c.id === id)
}

export function add(record: Omit<ContractRecord, 'id'>): ContractRecord {
  const all = loadAll()
  const id = all.length > 0 ? Math.max(...all.map(c => c.id)) + 1 : 1
  const created: ContractRecord = { id, ...record }
  all.push(created)
  saveAll(all)
  return created
}

export function update(id: number, changes: Partial<Omit<ContractRecord, 'id'>>): ContractRecord | undefined {
  const all = loadAll()
  const idx = all.findIndex(c => c.id === id)
  if (idx === -1) return undefined
  all[idx] = { ...all[idx], ...changes }
  saveAll(all)
  return all[idx]
}
