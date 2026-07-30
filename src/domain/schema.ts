import { z } from 'zod'
import { DATA_VERSION } from './types'

const depreciationSchema = z.object({
  lossRates: z.array(z.number().min(0).max(1)).min(1),
  tailRate: z.number().min(0).max(1),
  floorFraction: z.number().min(0).max(1),
})

const insuranceSchema = z.object({
  year1Premium: z.number().min(0),
  annualDeclineRate: z.number().min(0).max(1),
  floorPremium: z.number().min(0),
})

const maintenanceSchema = z.object({
  annualRoutine: z.number().min(0),
  referenceKm: z.number().positive(),
  baseRepairs: z.number().min(0),
  repairGrowthPerYear: z.number().min(0),
  warrantyYears: z.number().min(0),
  warrantyKm: z.number().min(0),
})

const energySchema = z.object({
  powertrain: z.enum(['gas', 'hybrid', 'electric']),
  efficiency: z.number().positive(),
})

const financingSchema = z.object({
  enabled: z.boolean(),
  downPayment: z.number().min(0),
  annualRate: z.number().min(0),
  termMonths: z.number().int().min(0),
})

const feesSchema = z.object({
  salesTaxRate: z.number().min(0).max(1),
  docTitleFees: z.number().min(0),
  annualRegistration: z.number().min(0),
  propertyTaxRate: z.number().min(0).max(1),
})

export const vehicleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  year: z.number().int().min(1980).max(2100),
  make: z.string(),
  model: z.string(),
  condition: z.enum(['new', 'used']),
  segment: z.enum(['compact', 'sedan', 'suv', 'truck', 'ev', 'luxury']),
  purchasePrice: z.number().positive(),
  purchaseAgeYears: z.number().min(0),
  purchaseKm: z.number().min(0),
  color: z.string().min(1),
  depreciation: depreciationSchema,
  insurance: insuranceSchema,
  maintenance: maintenanceSchema,
  energy: energySchema,
  financing: financingSchema,
  fees: feesSchema,
})

export const assumptionsSchema = z.object({
  horizonYears: z.number().int().min(1).max(30),
  annualKm: z.number().positive(),
  fuelPricePerLitre: z.number().positive(),
  electricityPricePerKwh: z.number().positive(),
  energyEscalationRate: z.number().min(0).max(1),
  inflationRate: z.number().min(0).max(1),
  discountRate: z.number().min(0).max(1),
})

export const garageExportSchema = z.object({
  version: z.literal(DATA_VERSION),
  exportedAt: z.string(),
  assumptions: assumptionsSchema,
  vehicles: z.array(vehicleSchema),
})

export type VehicleInput = z.infer<typeof vehicleSchema>
export type AssumptionsInput = z.infer<typeof assumptionsSchema>
