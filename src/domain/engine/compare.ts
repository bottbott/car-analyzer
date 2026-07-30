import type {
  Breakeven,
  ComparisonResult,
  GlobalAssumptions,
  Vehicle,
  VehicleProjection,
} from '../types'
import { projectVehicle } from './project'

export function compareVehicles(
  vehicles: Vehicle[],
  assumptions: GlobalAssumptions,
): ComparisonResult {
  const projections = vehicles.map((v) => projectVehicle(v, assumptions))

  let cheapestId: string | null = null
  let cheapestCost = Infinity
  for (const p of projections) {
    if (p.totalEconomicTco < cheapestCost) {
      cheapestCost = p.totalEconomicTco
      cheapestId = p.vehicleId
    }
  }

  const breakevens = findBreakevens(projections)

  return { projections, breakevens, cheapestId }
}

/**
 * For each pair of vehicles, find the first ownership year where the
 * cumulatively-cheaper ranking flips relative to year 1.
 */
export function findBreakevens(projections: VehicleProjection[]): Breakeven[] {
  const results: Breakeven[] = []

  for (let i = 0; i < projections.length; i++) {
    for (let j = i + 1; j < projections.length; j++) {
      const a = projections[i]!
      const b = projections[j]!
      results.push(breakevenBetween(a, b))
    }
  }

  return results
}

function breakevenBetween(a: VehicleProjection, b: VehicleProjection): Breakeven {
  const years = Math.min(a.years.length, b.years.length)
  if (years === 0) {
    return {
      vehicleAId: a.vehicleId,
      vehicleBId: b.vehicleId,
      vehicleAName: a.vehicleName,
      vehicleBName: b.vehicleName,
      year: null,
    }
  }

  const aFirst = a.years[0]!.cumulativeEconomic
  const bFirst = b.years[0]!.cumulativeEconomic
  const aCheaperAtStart = aFirst <= bFirst

  let year: number | null = null
  for (let i = 1; i < years; i++) {
    const aCum = a.years[i]!.cumulativeEconomic
    const bCum = b.years[i]!.cumulativeEconomic
    const aCheaperNow = aCum <= bCum
    if (aCheaperNow !== aCheaperAtStart) {
      year = i + 1 // 1-based ownership year
      break
    }
  }

  return {
    vehicleAId: a.vehicleId,
    vehicleBId: b.vehicleId,
    vehicleAName: a.vehicleName,
    vehicleBName: b.vehicleName,
    year,
  }
}

export function cumulativeSeries(projection: VehicleProjection): number[] {
  return projection.years.map((y) => y.cumulativeEconomic)
}
