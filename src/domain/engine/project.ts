import type {
  CostTotals,
  GlobalAssumptions,
  Vehicle,
  VehicleProjection,
  YearCostRow,
} from '../types'
import { depreciationForYear, residualValue } from './depreciation'
import { energyCost } from './energy'
import {
  propertyTaxCost,
  registrationCost,
  salesTaxAmount,
} from './fees'
import {
  buildLoanSchedule,
  loanPrincipalAmount,
  type LoanScheduleYear,
} from './financing'
import { insurancePremium } from './insurance'
import { repairCost, routineMaintenanceCost } from './maintenance'

function emptyTotals(): CostTotals {
  return {
    depreciation: 0,
    insurance: 0,
    routineMaintenance: 0,
    repairs: 0,
    energy: 0,
    loanInterest: 0,
    registration: 0,
    propertyTax: 0,
    salesTax: 0,
    upfrontFees: 0,
  }
}

function inflate(rate: number, ownershipYear: number): number {
  return Math.pow(1 + rate, ownershipYear - 1)
}

function discountFactor(rate: number, ownershipYear: number): number {
  if (rate <= 0) return 1
  return 1 / Math.pow(1 + rate, ownershipYear)
}

/**
 * Project year-by-year ownership costs for a single vehicle.
 *
 * Economic cost treats depreciation (not purchase price) as the asset cost,
 * and loan interest (not principal) as the financing cost. Upfront sales tax
 * and doc/title fees land in year 1.
 *
 * Cash-flow cost tracks actual money out; at the horizon, net equity
 * (residual − loan balance) is credited so economic and cash totals reconcile.
 */
export function projectVehicle(
  vehicle: Vehicle,
  assumptions: GlobalAssumptions,
): VehicleProjection {
  const { horizonYears, annualKm } = assumptions
  const salesTax = salesTaxAmount(vehicle.purchasePrice, vehicle.fees)
  const upfrontFees = vehicle.fees.docTitleFees

  let loanYears: LoanScheduleYear[] = []
  if (vehicle.financing.enabled) {
    const principal = loanPrincipalAmount(
      vehicle.purchasePrice,
      salesTax,
      upfrontFees,
      vehicle.financing.downPayment,
    )
    loanYears = buildLoanSchedule(
      {
        principal,
        annualRate: vehicle.financing.annualRate,
        termMonths: vehicle.financing.termMonths,
      },
      horizonYears,
    )
  }

  const years: YearCostRow[] = []
  const totals = emptyTotals()
  let cumulativeEconomic = 0
  let cumulativeCash = 0
  let cumulativePv = 0

  for (let y = 1; y <= horizonYears; y++) {
    const ageStart = vehicle.purchaseAgeYears + (y - 1)
    const ageEnd = vehicle.purchaseAgeYears + y
    const ageMid = ageStart + 0.5
    const kmStart = vehicle.purchaseKm + annualKm * (y - 1)
    const kmEnd = kmStart + annualKm
    const kmMid = kmStart + annualKm / 2
    const inflationFactor = inflate(assumptions.inflationRate, y)

    const residualEnd = residualValue(
      ageEnd,
      vehicle.purchasePrice,
      vehicle.purchaseAgeYears,
      vehicle.depreciation,
    )
    const dep = depreciationForYear(
      ageStart,
      ageEnd,
      vehicle.purchasePrice,
      vehicle.purchaseAgeYears,
      vehicle.depreciation,
    )

    const insurance = insurancePremium(y, vehicle.insurance)
    const routine = routineMaintenanceCost(
      annualKm,
      vehicle.maintenance,
      inflationFactor,
    )
    const repairs = repairCost(ageMid, kmMid, vehicle.maintenance, inflationFactor)
    const energy = energyCost(annualKm, y, vehicle.energy, assumptions)
    const registration = registrationCost(vehicle.fees, inflationFactor)
    const propertyTax = propertyTaxCost(residualEnd, vehicle.fees)

    const loan = loanYears[y - 1]
    const loanInterest = loan?.interest ?? 0
    const loanPrincipal = loan?.principal ?? 0
    const loanPayment = loan?.payment ?? 0
    const loanBalance = loan?.balanceEnd ?? 0

    const yearSalesTax = y === 1 ? salesTax : 0
    const yearUpfront = y === 1 ? upfrontFees : 0

    const economicCost =
      dep +
      insurance +
      routine +
      repairs +
      energy +
      loanInterest +
      registration +
      propertyTax +
      yearSalesTax +
      yearUpfront

    const operatingCash =
      insurance + routine + repairs + energy + registration + propertyTax

    const cashOut = vehicle.financing.enabled
      ? (y === 1 ? vehicle.financing.downPayment : 0) + loanPayment + operatingCash
      : (y === 1 ? vehicle.purchasePrice + salesTax + upfrontFees : 0) +
        operatingCash

    cumulativeEconomic += economicCost
    cumulativeCash += cashOut
    cumulativePv += economicCost * discountFactor(assumptions.discountRate, y)

    totals.depreciation += dep
    totals.insurance += insurance
    totals.routineMaintenance += routine
    totals.repairs += repairs
    totals.energy += energy
    totals.loanInterest += loanInterest
    totals.registration += registration
    totals.propertyTax += propertyTax
    totals.salesTax += yearSalesTax
    totals.upfrontFees += yearUpfront

    years.push({
      yearIndex: y,
      vehicleAgeYears: ageEnd,
      kmAtStart: kmStart,
      kmAtEnd: kmEnd,
      residualValue: residualEnd,
      loanBalance,
      depreciation: dep,
      insurance,
      routineMaintenance: routine,
      repairs,
      energy,
      loanInterest,
      loanPrincipal,
      loanPayment,
      registration,
      propertyTax,
      upfrontFees: yearUpfront,
      salesTax: yearSalesTax,
      economicCost,
      cashOut,
      cumulativeEconomic,
      cumulativeCash,
    } satisfies YearCostRow)
  }

  const last = years[years.length - 1]!
  const endResidualValue = last.residualValue
  const endLoanBalance = last.loanBalance
  const endEquity = endResidualValue - endLoanBalance

  const totalEconomicTco = cumulativeEconomic
  const totalKm = annualKm * horizonYears

  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    color: vehicle.color,
    years,
    totals,
    endResidualValue,
    endLoanBalance,
    endEquity,
    totalEconomicTco,
    totalEconomicTcoPv:
      assumptions.discountRate > 0 ? cumulativePv : totalEconomicTco,
    averageMonthly: totalEconomicTco / (horizonYears * 12),
    costPerKm: totalKm > 0 ? totalEconomicTco / totalKm : 0,
  }
}

/** Cash-flow TCO after crediting end-of-horizon equity. */
export function cashFlowTco(projection: VehicleProjection): number {
  const last = projection.years[projection.years.length - 1]
  if (!last) return 0
  return last.cumulativeCash - projection.endEquity
}
