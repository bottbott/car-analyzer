import type { GlobalAssumptions, SegmentPreset, Vehicle } from './types'

export const DEFAULT_ASSUMPTIONS: GlobalAssumptions = {
  horizonYears: 5,
  annualKm: 20_000,
  fuelPricePerLitre: 1.6,
  electricityPricePerKwh: 0.16,
  energyEscalationRate: 0.03,
  inflationRate: 0.025,
  discountRate: 0,
}

const DEFAULT_LOSS_RATES = [0.2, 0.13, 0.12, 0.11, 0.1, 0.09, 0.08]

export const SEGMENT_PRESETS: SegmentPreset[] = [
  {
    id: 'compact',
    label: 'Compact',
    description: 'Small, efficient, lower insurance and maintenance.',
    defaults: {
      typicalNewPrice: 24_000,
      depreciation: {
        lossRates: DEFAULT_LOSS_RATES,
        tailRate: 0.07,
        floorFraction: 0.12,
      },
      insurance: {
        year1Premium: 1_400,
        annualDeclineRate: 0.06,
        floorPremium: 800,
      },
      maintenance: {
        annualRoutine: 450,
        referenceKm: 20_000,
        baseRepairs: 200,
        repairGrowthPerYear: 80,
        warrantyYears: 3,
        warrantyKm: 60_000,
      },
      energy: { powertrain: 'gas', efficiency: 7.4 },
      fees: {
        salesTaxRate: 0.07,
        docTitleFees: 350,
        annualRegistration: 120,
        propertyTaxRate: 0,
      },
    },
  },
  {
    id: 'sedan',
    label: 'Sedan',
    description: 'Midsize family sedan with average ownership costs.',
    defaults: {
      typicalNewPrice: 32_000,
      depreciation: {
        lossRates: DEFAULT_LOSS_RATES,
        tailRate: 0.07,
        floorFraction: 0.12,
      },
      insurance: {
        year1Premium: 1_700,
        annualDeclineRate: 0.055,
        floorPremium: 950,
      },
      maintenance: {
        annualRoutine: 550,
        referenceKm: 20_000,
        baseRepairs: 250,
        repairGrowthPerYear: 100,
        warrantyYears: 3,
        warrantyKm: 60_000,
      },
      energy: { powertrain: 'gas', efficiency: 8.4 },
      fees: {
        salesTaxRate: 0.07,
        docTitleFees: 400,
        annualRegistration: 140,
        propertyTaxRate: 0,
      },
    },
  },
  {
    id: 'suv',
    label: 'SUV / Crossover',
    description: 'Higher insurance, fuel, and tire costs.',
    defaults: {
      typicalNewPrice: 40_000,
      depreciation: {
        lossRates: [0.22, 0.14, 0.12, 0.11, 0.1, 0.09, 0.08],
        tailRate: 0.07,
        floorFraction: 0.14,
      },
      insurance: {
        year1Premium: 2_000,
        annualDeclineRate: 0.05,
        floorPremium: 1_100,
      },
      maintenance: {
        annualRoutine: 700,
        referenceKm: 20_000,
        baseRepairs: 300,
        repairGrowthPerYear: 120,
        warrantyYears: 3,
        warrantyKm: 60_000,
      },
      energy: { powertrain: 'gas', efficiency: 9.8 },
      fees: {
        salesTaxRate: 0.07,
        docTitleFees: 450,
        annualRegistration: 180,
        propertyTaxRate: 0,
      },
    },
  },
  {
    id: 'truck',
    label: 'Pickup Truck',
    description: 'Strong residual value, higher fuel and insurance.',
    defaults: {
      typicalNewPrice: 48_000,
      depreciation: {
        lossRates: [0.18, 0.11, 0.1, 0.09, 0.08, 0.07, 0.07],
        tailRate: 0.06,
        floorFraction: 0.18,
      },
      insurance: {
        year1Premium: 2_200,
        annualDeclineRate: 0.045,
        floorPremium: 1_200,
      },
      maintenance: {
        annualRoutine: 800,
        referenceKm: 20_000,
        baseRepairs: 350,
        repairGrowthPerYear: 130,
        warrantyYears: 3,
        warrantyKm: 60_000,
      },
      energy: { powertrain: 'gas', efficiency: 11.8 },
      fees: {
        salesTaxRate: 0.07,
        docTitleFees: 500,
        annualRegistration: 220,
        propertyTaxRate: 0,
      },
    },
  },
  {
    id: 'ev',
    label: 'Electric',
    description: 'Low energy cost, higher purchase price, lower routine maintenance.',
    defaults: {
      typicalNewPrice: 45_000,
      depreciation: {
        lossRates: [0.25, 0.15, 0.13, 0.11, 0.1, 0.09, 0.08],
        tailRate: 0.07,
        floorFraction: 0.1,
      },
      insurance: {
        year1Premium: 2_100,
        annualDeclineRate: 0.05,
        floorPremium: 1_150,
      },
      maintenance: {
        annualRoutine: 300,
        referenceKm: 20_000,
        baseRepairs: 150,
        repairGrowthPerYear: 90,
        warrantyYears: 8,
        warrantyKm: 160_000,
      },
      energy: { powertrain: 'electric', efficiency: 5.6 },
      fees: {
        salesTaxRate: 0.07,
        docTitleFees: 450,
        annualRegistration: 200,
        propertyTaxRate: 0,
      },
    },
  },
  {
    id: 'luxury',
    label: 'Luxury',
    description: 'Steep depreciation, high insurance and repair costs.',
    defaults: {
      typicalNewPrice: 65_000,
      depreciation: {
        lossRates: [0.28, 0.16, 0.14, 0.12, 0.11, 0.1, 0.09],
        tailRate: 0.08,
        floorFraction: 0.08,
      },
      insurance: {
        year1Premium: 2_800,
        annualDeclineRate: 0.06,
        floorPremium: 1_400,
      },
      maintenance: {
        annualRoutine: 1_100,
        referenceKm: 20_000,
        baseRepairs: 500,
        repairGrowthPerYear: 200,
        warrantyYears: 4,
        warrantyKm: 80_000,
      },
      energy: { powertrain: 'gas', efficiency: 10.7 },
      fees: {
        salesTaxRate: 0.07,
        docTitleFees: 600,
        annualRegistration: 250,
        propertyTaxRate: 0,
      },
    },
  },
]

export function getPreset(segment: SegmentPreset['id']): SegmentPreset {
  const preset = SEGMENT_PRESETS.find((p) => p.id === segment)
  if (!preset) throw new Error(`Unknown segment: ${segment}`)
  return preset
}

const VEHICLE_COLORS = [
  '#0f766e',
  '#2563eb',
  '#c2410c',
  '#7c3aed',
  '#be123c',
  '#a16207',
]

export function createVehicleId(): string {
  return `veh_${crypto.randomUUID().slice(0, 8)}`
}

export function createVehicleFromPreset(
  segment: SegmentPreset['id'],
  overrides: Partial<Vehicle> = {},
): Vehicle {
  const preset = getPreset(segment)
  const { typicalNewPrice, ...defaults } = preset.defaults
  const colorIndex = Math.floor(Math.random() * VEHICLE_COLORS.length)
  const purchasePrice = overrides.purchasePrice ?? typicalNewPrice

  return {
    id: createVehicleId(),
    name: `New ${preset.label}`,
    year: new Date().getFullYear(),
    make: '',
    model: '',
    condition: 'new',
    segment,
    purchasePrice,
    purchaseAgeYears: 0,
    purchaseKm: 0,
    color: VEHICLE_COLORS[colorIndex]!,
    ...defaults,
    ...overrides,
    depreciation: { ...defaults.depreciation, ...overrides.depreciation },
    insurance: { ...defaults.insurance, ...overrides.insurance },
    maintenance: { ...defaults.maintenance, ...overrides.maintenance },
    energy: { ...defaults.energy, ...overrides.energy },
    fees: { ...defaults.fees, ...overrides.fees },
    financing: {
      enabled: false,
      downPayment: 0,
      annualRate: 0.065,
      termMonths: 60,
      ...overrides.financing,
    },
  }
}

/** Seed garage shown on first run. */
export function createSampleVehicles(): Vehicle[] {
  return [
    createVehicleFromPreset('compact', {
      id: 'sample_new_corolla_hatch',
      name: '2027 Corolla Hatchback (New)',
      year: 2027,
      make: 'Toyota',
      model: 'Corolla Hatchback CVT',
      condition: 'new',
      purchasePrice: 33_000,
      purchaseAgeYears: 0,
      purchaseKm: 15,
      color: '#c2410c',
      // Toyota Canada: 7.5 / 5.9 city/hwy L/100km → ~6.8 combined (55/45)
      // https://www.toyota.ca/en/vehicles/corolla-hatchback/overview/
      energy: { powertrain: 'gas', efficiency: 6.8 },
      maintenance: {
        annualRoutine: 450,
        referenceKm: 20_000,
        baseRepairs: 200,
        repairGrowthPerYear: 80,
        warrantyYears: 3,
        warrantyKm: 60_000,
      },
    }),
    createVehicleFromPreset('compact', {
      id: 'sample_used_yaris',
      name: '2019 Yaris Hatchback LE (Used)',
      year: 2019,
      make: 'Toyota',
      model: 'Yaris Hatchback LE',
      condition: 'used',
      purchasePrice: 17_000,
      purchaseAgeYears: 7,
      purchaseKm: 103_947,
      color: '#a16207',
      // Subaru City Edmonton listing: 7.9 / 6.7 city/hwy → ~7.4 combined
      // https://www.subarucity.ca/vehicles/2019/toyota/yaris-hatchback/edmonton/ab/70161061/
      energy: { powertrain: 'gas', efficiency: 7.4 },
      insurance: {
        year1Premium: 1_200,
        annualDeclineRate: 0.05,
        floorPremium: 750,
      },
      maintenance: {
        annualRoutine: 500,
        referenceKm: 20_000,
        baseRepairs: 280,
        repairGrowthPerYear: 90,
        warrantyYears: 0,
        warrantyKm: 0,
      },
    }),
    createVehicleFromPreset('sedan', {
      id: 'sample_new_camry',
      name: '2026 Camry (New)',
      year: 2026,
      make: 'Toyota',
      model: 'Camry LE',
      condition: 'new',
      purchasePrice: 29_500,
      purchaseAgeYears: 0,
      purchaseKm: 15,
      color: '#0f766e',
      energy: { powertrain: 'hybrid', efficiency: 4.9 },
    }),
    createVehicleFromPreset('sedan', {
      id: 'sample_used_accord',
      name: '2022 Accord (Used)',
      year: 2022,
      make: 'Honda',
      model: 'Accord Sport',
      condition: 'used',
      purchasePrice: 22_000,
      purchaseAgeYears: 4,
      purchaseKm: 77_000,
      color: '#2563eb',
      insurance: {
        year1Premium: 1_450,
        annualDeclineRate: 0.05,
        floorPremium: 900,
      },
      maintenance: {
        annualRoutine: 600,
        referenceKm: 20_000,
        baseRepairs: 280,
        repairGrowthPerYear: 110,
        warrantyYears: 0,
        warrantyKm: 0,
      },
      energy: { powertrain: 'gas', efficiency: 7.8 },
    }),
    createVehicleFromPreset('ev', {
      id: 'sample_new_model3',
      name: '2026 Model 3 (New)',
      year: 2026,
      make: 'Tesla',
      model: 'Model 3 RWD',
      condition: 'new',
      purchasePrice: 42_500,
      purchaseAgeYears: 0,
      purchaseKm: 15,
      color: '#7c3aed',
    }),
  ]
}

export { VEHICLE_COLORS }
