/** Domain types for the Vehicle TCO Analyzer */

export type Condition = 'new' | 'used'
export type Powertrain = 'gas' | 'hybrid' | 'electric'
export type Segment =
  | 'compact'
  | 'sedan'
  | 'suv'
  | 'truck'
  | 'ev'
  | 'luxury'

export interface DepreciationConfig {
  /** Year-over-year loss rates starting from new (year 1, 2, ...). Values like 0.20 = 20%. */
  lossRates: number[]
  /** Annual loss rate applied after the explicit rates. */
  tailRate: number
  /** Minimum residual value as a fraction of MSRP/original new value. */
  floorFraction: number
}

export interface InsuranceConfig {
  year1Premium: number
  annualDeclineRate: number
  floorPremium: number
}

export interface MaintenanceConfig {
  /** Baseline annual routine maintenance at the reference distance. */
  annualRoutine: number
  /** Reference annual kilometres for routine cost scaling. */
  referenceKm: number
  /** Base annual repair cost when out of warranty at age 0 equivalent. */
  baseRepairs: number
  /** Extra repair cost growth per year of vehicle age. */
  repairGrowthPerYear: number
  warrantyYears: number
  warrantyKm: number
}

export interface EnergyConfig {
  powertrain: Powertrain
  /**
   * Gas/hybrid: litres per 100 km (L/100km).
   * Electric: kilometres per kWh (km/kWh).
   */
  efficiency: number
}

export interface FinancingConfig {
  enabled: boolean
  downPayment: number
  annualRate: number
  termMonths: number
}

export interface FeesConfig {
  salesTaxRate: number
  docTitleFees: number
  annualRegistration: number
  /** Optional annual property tax as a fraction of residual value. */
  propertyTaxRate: number
}

export interface Vehicle {
  id: string
  name: string
  year: number
  make: string
  model: string
  condition: Condition
  segment: Segment
  purchasePrice: number
  /** Age in years at purchase (0 for new). */
  purchaseAgeYears: number
  /** Odometer at purchase (km). */
  purchaseKm: number
  /** Color used in charts. */
  color: string
  depreciation: DepreciationConfig
  insurance: InsuranceConfig
  maintenance: MaintenanceConfig
  energy: EnergyConfig
  financing: FinancingConfig
  fees: FeesConfig
}

export interface GlobalAssumptions {
  horizonYears: number
  annualKm: number
  fuelPricePerLitre: number
  electricityPricePerKwh: number
  /** Annual escalation for energy prices (e.g. 0.03 = 3%). */
  energyEscalationRate: number
  /** General inflation applied to maintenance/repairs/registration. */
  inflationRate: number
  /** Optional discount rate for present-value comparison (0 = nominal). */
  discountRate: number
}

export interface YearCostRow {
  yearIndex: number
  vehicleAgeYears: number
  kmAtStart: number
  kmAtEnd: number
  residualValue: number
  loanBalance: number
  depreciation: number
  insurance: number
  routineMaintenance: number
  repairs: number
  energy: number
  loanInterest: number
  loanPrincipal: number
  loanPayment: number
  registration: number
  propertyTax: number
  upfrontFees: number
  salesTax: number
  /** Economic annual cost (excludes principal). */
  economicCost: number
  /** Cash out this year (payments + operating + fees). */
  cashOut: number
  /** Cumulative economic TCO through this year (net of residual relative to purchase). */
  cumulativeEconomic: number
  /** Cumulative cash out through this year. */
  cumulativeCash: number
}

export interface VehicleProjection {
  vehicleId: string
  vehicleName: string
  color: string
  years: YearCostRow[]
  totals: CostTotals
  endResidualValue: number
  endLoanBalance: number
  /** Net equity at horizon = residual - loan balance. */
  endEquity: number
  /** Economic TCO over the horizon (purchase - residual + operating + interest + fees). */
  totalEconomicTco: number
  /** Present value of economic costs if discountRate > 0. */
  totalEconomicTcoPv: number
  averageMonthly: number
  costPerKm: number
}

export interface CostTotals {
  depreciation: number
  insurance: number
  routineMaintenance: number
  repairs: number
  energy: number
  loanInterest: number
  registration: number
  propertyTax: number
  salesTax: number
  upfrontFees: number
}

export interface Breakeven {
  vehicleAId: string
  vehicleBId: string
  vehicleAName: string
  vehicleBName: string
  /** First year index (1-based ownership year) where A becomes cheaper cumulatively than B, or null. */
  year: number | null
}

export interface ComparisonResult {
  projections: VehicleProjection[]
  breakevens: Breakeven[]
  cheapestId: string | null
}

export interface SegmentPreset {
  id: Segment
  label: string
  description: string
  defaults: Pick<
    Vehicle,
    | 'depreciation'
    | 'insurance'
    | 'maintenance'
    | 'energy'
    | 'fees'
  > & {
    typicalNewPrice: number
  }
}

export const DATA_VERSION = 2 as const

export interface GarageExport {
  version: typeof DATA_VERSION
  exportedAt: string
  assumptions: GlobalAssumptions
  vehicles: Vehicle[]
}
