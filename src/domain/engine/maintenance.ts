import type { MaintenanceConfig } from '../types'

export function routineMaintenanceCost(
  annualKm: number,
  config: MaintenanceConfig,
  inflationFactor: number,
): number {
  const scaled = config.annualRoutine * (annualKm / config.referenceKm)
  return scaled * inflationFactor
}

export function isUnderWarranty(
  vehicleAgeYears: number,
  odometerKm: number,
  config: MaintenanceConfig,
): boolean {
  return (
    vehicleAgeYears < config.warrantyYears && odometerKm < config.warrantyKm
  )
}

/**
 * Expected out-of-warranty repair cost for a year of ownership.
 * Uses mid-year age/odometer as a simple approximation for warranty coverage.
 */
export function repairCost(
  ageAtMidYear: number,
  kmAtMidYear: number,
  config: MaintenanceConfig,
  inflationFactor: number,
): number {
  if (isUnderWarranty(ageAtMidYear, kmAtMidYear, config)) {
    return 0
  }
  const ageComponent =
    config.baseRepairs + config.repairGrowthPerYear * Math.max(0, ageAtMidYear)
  return ageComponent * inflationFactor
}
