import type { EnergyConfig, GlobalAssumptions } from '../types'

export function energyCost(
  annualKm: number,
  ownershipYear: number,
  energy: EnergyConfig,
  assumptions: GlobalAssumptions,
): number {
  const escalation = Math.pow(
    1 + assumptions.energyEscalationRate,
    ownershipYear - 1,
  )

  if (energy.powertrain === 'electric') {
    // efficiency = km per kWh
    const kwh = annualKm / energy.efficiency
    return kwh * assumptions.electricityPricePerKwh * escalation
  }

  // gas / hybrid: efficiency = L/100km
  const litres = (annualKm / 100) * energy.efficiency
  return litres * assumptions.fuelPricePerLitre * escalation
}
