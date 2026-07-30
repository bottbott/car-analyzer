import { describe, expect, it } from 'vitest'
import { retainedFraction, residualValue } from './depreciation'
import { insurancePremium } from './insurance'
import { isUnderWarranty, repairCost } from './maintenance'
import {
  buildLoanSchedule,
  monthlyPayment,
  loanPrincipalAmount,
} from './financing'
import { cashFlowTco, projectVehicle } from './project'
import { createVehicleFromPreset, DEFAULT_ASSUMPTIONS } from '../presets'
import type { DepreciationConfig } from '../types'

const curve: DepreciationConfig = {
  lossRates: [0.2, 0.13, 0.12, 0.11, 0.1, 0.09, 0.08],
  tailRate: 0.07,
  floorFraction: 0.12,
}

describe('depreciation', () => {
  it('retains 100% at age 0', () => {
    expect(retainedFraction(0, curve)).toBe(1)
  })

  it('applies first-year loss', () => {
    expect(retainedFraction(1, curve)).toBeCloseTo(0.8, 5)
  })

  it('anchors used-car value so purchaseAge value equals purchasePrice', () => {
    const purchasePrice = 22_000
    const purchaseAge = 3
    const atPurchase = residualValue(purchaseAge, purchasePrice, purchaseAge, curve)
    expect(atPurchase).toBeCloseTo(purchasePrice, 5)
  })

  it('depreciates used cars more slowly than new at the same calendar year', () => {
    const newCar = residualValue(1, 30_000, 0, curve)
    const usedCar = residualValue(4, 22_000, 3, curve)
    // New car loses ~20% in year 1; used (age 3→4) loses ~11% of its anchored value
    const newLoss = 30_000 - newCar
    const usedLoss = 22_000 - usedCar
    expect(usedLoss).toBeLessThan(newLoss)
  })

  it('respects the floor', () => {
    const v = residualValue(40, 30_000, 0, curve)
    expect(v).toBeGreaterThanOrEqual(30_000 * curve.floorFraction - 0.01)
  })
})

describe('insurance', () => {
  it('starts at year1 premium', () => {
    expect(
      insurancePremium(1, {
        year1Premium: 1700,
        annualDeclineRate: 0.05,
        floorPremium: 900,
      }),
    ).toBe(1700)
  })

  it('declines and respects the floor', () => {
    const config = {
      year1Premium: 1700,
      annualDeclineRate: 0.5,
      floorPremium: 900,
    }
    expect(insurancePremium(2, config)).toBe(900) // raw 850, floored to 900
    expect(insurancePremium(2, { ...config, floorPremium: 800 })).toBe(850)
    expect(insurancePremium(10, config)).toBe(900)
  })
})

describe('maintenance / warranty', () => {
  const config = {
    annualRoutine: 500,
    referenceKm: 20_000,
    baseRepairs: 200,
    repairGrowthPerYear: 100,
    warrantyYears: 3,
    warrantyKm: 60_000,
  }

  it('suppresses repairs under warranty', () => {
    expect(isUnderWarranty(1, 15_000, config)).toBe(true)
    expect(repairCost(1, 15_000, config, 1)).toBe(0)
  })

  it('charges repairs when warranty expired by age', () => {
    expect(isUnderWarranty(3.5, 30_000, config)).toBe(false)
    expect(repairCost(3.5, 30_000, config, 1)).toBeCloseTo(200 + 100 * 3.5, 5)
  })

  it('charges repairs when warranty expired by kilometres', () => {
    expect(isUnderWarranty(1, 65_000, config)).toBe(false)
    expect(repairCost(1, 65_000, config, 1)).toBeGreaterThan(0)
  })
})

describe('financing', () => {
  it('computes a known monthly payment', () => {
    // $20,000 at 6% for 60 months ≈ $386.66
    const pmt = monthlyPayment({
      principal: 20_000,
      annualRate: 0.06,
      termMonths: 60,
    })
    expect(pmt).toBeCloseTo(386.66, 1)
  })

  it('handles zero interest', () => {
    expect(
      monthlyPayment({ principal: 12_000, annualRate: 0, termMonths: 24 }),
    ).toBe(500)
  })

  it('builds a schedule that pays down to near zero', () => {
    const schedule = buildLoanSchedule(
      { principal: 20_000, annualRate: 0.06, termMonths: 60 },
      5,
    )
    expect(schedule).toHaveLength(5)
    expect(schedule[4]!.balanceEnd).toBeLessThan(1)
    const totalPrincipal = schedule.reduce((s, y) => s + y.principal, 0)
    expect(totalPrincipal).toBeCloseTo(20_000, 0)
  })

  it('computes loan principal from price, tax, fees, and down payment', () => {
    expect(loanPrincipalAmount(30_000, 2_100, 400, 5_000)).toBe(27_500)
  })
})

describe('projection reconciliation', () => {
  it('reconciles economic TCO with cash-flow TCO for a financed vehicle', () => {
    const vehicle = createVehicleFromPreset('sedan', {
      purchasePrice: 30_000,
      purchaseAgeYears: 0,
      purchaseKm: 0,
      financing: {
        enabled: true,
        downPayment: 5_000,
        annualRate: 0.06,
        termMonths: 60,
      },
    })
    const assumptions = { ...DEFAULT_ASSUMPTIONS, horizonYears: 5, discountRate: 0 }
    const projection = projectVehicle(vehicle, assumptions)
    const cash = cashFlowTco(projection)
    expect(cash).toBeCloseTo(projection.totalEconomicTco, 0)
  })

  it('reconciles economic TCO with cash-flow TCO for a cash purchase', () => {
    const vehicle = createVehicleFromPreset('compact', {
      purchasePrice: 24_000,
      financing: {
        enabled: false,
        downPayment: 0,
        annualRate: 0,
        termMonths: 0,
      },
    })
    const assumptions = { ...DEFAULT_ASSUMPTIONS, horizonYears: 4 }
    const projection = projectVehicle(vehicle, assumptions)
    expect(cashFlowTco(projection)).toBeCloseTo(projection.totalEconomicTco, 0)
  })

  it('reconciles for a used financed vehicle when loan outlasts horizon', () => {
    const vehicle = createVehicleFromPreset('sedan', {
      condition: 'used',
      purchasePrice: 18_000,
      purchaseAgeYears: 4,
      purchaseKm: 80_000,
      financing: {
        enabled: true,
        downPayment: 2_000,
        annualRate: 0.08,
        termMonths: 72,
      },
      maintenance: {
        annualRoutine: 600,
        referenceKm: 20_000,
        baseRepairs: 300,
        repairGrowthPerYear: 100,
        warrantyYears: 0,
        warrantyKm: 0,
      },
    })
    const assumptions = { ...DEFAULT_ASSUMPTIONS, horizonYears: 3 }
    const projection = projectVehicle(vehicle, assumptions)
    expect(projection.endLoanBalance).toBeGreaterThan(0)
    expect(cashFlowTco(projection)).toBeCloseTo(projection.totalEconomicTco, 0)
  })

  it('shows zero repairs while under warranty for a new car', () => {
    const vehicle = createVehicleFromPreset('sedan', {
      purchaseAgeYears: 0,
      purchaseKm: 0,
      maintenance: {
        annualRoutine: 500,
        referenceKm: 20_000,
        baseRepairs: 400,
        repairGrowthPerYear: 100,
        warrantyYears: 3,
        warrantyKm: 60_000,
      },
    })
    const assumptions = {
      ...DEFAULT_ASSUMPTIONS,
      horizonYears: 3,
      annualKm: 15_000,
    }
    const projection = projectVehicle(vehicle, assumptions)
    expect(projection.totals.repairs).toBe(0)
  })
})
