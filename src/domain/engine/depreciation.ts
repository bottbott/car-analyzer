import type { DepreciationConfig } from '../types'

/**
 * Fraction of original new value retained at a given age (years since new).
 * Age 0 => 1.0. After each year i (1-indexed), apply lossRates[i-1] or tailRate.
 */
export function retainedFraction(
  ageYears: number,
  config: DepreciationConfig,
): number {
  if (ageYears <= 0) return 1

  let retained = 1
  const wholeYears = Math.floor(ageYears)
  const fraction = ageYears - wholeYears

  for (let y = 1; y <= wholeYears; y++) {
    const rate = config.lossRates[y - 1] ?? config.tailRate
    retained *= 1 - rate
  }

  if (fraction > 0) {
    const nextRate = config.lossRates[wholeYears] ?? config.tailRate
    // Linear interpolation of the next year's loss for partial years
    retained *= 1 - nextRate * fraction
  }

  return Math.max(config.floorFraction, retained)
}

/**
 * Market value at `ageYears`, anchored so value(purchaseAge) === purchasePrice.
 * For used cars this places them further down the curve so they depreciate slower.
 */
export function residualValue(
  ageYears: number,
  purchasePrice: number,
  purchaseAgeYears: number,
  config: DepreciationConfig,
): number {
  const atPurchase = retainedFraction(purchaseAgeYears, config)
  const atAge = retainedFraction(ageYears, config)
  if (atPurchase <= 0) return Math.max(0, purchasePrice * config.floorFraction)

  const impliedNewValue = purchasePrice / atPurchase
  const floor = impliedNewValue * config.floorFraction
  return Math.max(floor, impliedNewValue * atAge)
}

export function depreciationForYear(
  ageAtStart: number,
  ageAtEnd: number,
  purchasePrice: number,
  purchaseAgeYears: number,
  config: DepreciationConfig,
): number {
  const start = residualValue(ageAtStart, purchasePrice, purchaseAgeYears, config)
  const end = residualValue(ageAtEnd, purchasePrice, purchaseAgeYears, config)
  return Math.max(0, start - end)
}
