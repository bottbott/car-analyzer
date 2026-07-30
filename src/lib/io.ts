import { garageExportSchema } from '@/domain/schema'
import type { GarageExport } from '@/domain/types'
import { DATA_VERSION } from '@/domain/types'
import type { GlobalAssumptions, Vehicle } from '@/domain/types'
import { downloadTextFile } from './csv'

export function buildExport(
  assumptions: GlobalAssumptions,
  vehicles: Vehicle[],
): GarageExport {
  return {
    version: DATA_VERSION,
    exportedAt: new Date().toISOString(),
    assumptions,
    vehicles,
  }
}

export function exportGarageJson(
  assumptions: GlobalAssumptions,
  vehicles: Vehicle[],
): void {
  const payload = buildExport(assumptions, vehicles)
  downloadTextFile(
    `car-analyzer-${new Date().toISOString().slice(0, 10)}.json`,
    JSON.stringify(payload, null, 2),
    'application/json',
  )
}

export function parseGarageImport(raw: string): GarageExport {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    throw new Error('File is not valid JSON.')
  }
  const parsed = garageExportSchema.safeParse(json)
  if (!parsed.success) {
    const issue = parsed.error.issues[0]
    const path = issue?.path.join('.') || 'root'
    throw new Error(`Invalid garage file: ${path} — ${issue?.message ?? 'unknown error'}`)
  }
  return parsed.data
}
