import type { FeesConfig } from '../types'

export function salesTaxAmount(purchasePrice: number, fees: FeesConfig): number {
  return purchasePrice * fees.salesTaxRate
}

export function registrationCost(
  fees: FeesConfig,
  inflationFactor: number,
): number {
  return fees.annualRegistration * inflationFactor
}

export function propertyTaxCost(
  residualValue: number,
  fees: FeesConfig,
): number {
  return residualValue * fees.propertyTaxRate
}
