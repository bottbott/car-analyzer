import type { InsuranceConfig } from '../types'

/** Insurance premium for ownership year `n` (1-based). */
export function insurancePremium(
  ownershipYear: number,
  config: InsuranceConfig,
): number {
  if (ownershipYear < 1) return 0
  const declined =
    config.year1Premium * Math.pow(1 - config.annualDeclineRate, ownershipYear - 1)
  return Math.max(config.floorPremium, declined)
}
