import { SEGMENT_PRESETS, getPreset } from '@/domain/presets'
import type { Condition, Powertrain, Segment, Vehicle } from '@/domain/types'
import { useGarage } from '@/store/useGarage'
import {
  Button,
  Card,
  FieldGrid,
  Input,
  Select,
  Toggle,
} from '@/components/ui'
import { formatCurrency } from '@/lib/format'

export function VehicleSidebar() {
  const vehicles = useGarage((s) => s.vehicles)
  const selectedVehicleId = useGarage((s) => s.selectedVehicleId)
  const selectVehicle = useGarage((s) => s.selectVehicle)
  const addVehicle = useGarage((s) => s.addVehicle)
  const removeVehicle = useGarage((s) => s.removeVehicle)
  const duplicateVehicle = useGarage((s) => s.duplicateVehicle)

  return (
    <Card
      title="Garage"
      description={`${vehicles.length} vehicle${vehicles.length === 1 ? '' : 's'}`}
      actions={
        <Select
          aria-label="Add vehicle from segment"
          defaultValue=""
          onChange={(e) => {
            const value = e.target.value as Segment | ''
            if (value) {
              addVehicle(value)
              e.target.value = ''
            }
          }}
          className="min-w-[9rem]"
        >
          <option value="">+ Add…</option>
          {SEGMENT_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
      }
    >
      <ul className="space-y-2">
        {vehicles.map((v) => {
          const selected = v.id === selectedVehicleId
          return (
            <li
              key={v.id}
              className={`rounded-xl border px-3 py-2.5 transition ${
                selected
                  ? 'border-teal-600 bg-teal-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <button
                type="button"
                onClick={() => selectVehicle(v.id)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: v.color }}
                    aria-hidden
                  />
                  <span className="truncate text-sm font-semibold text-slate-900">
                    {v.name}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {v.condition === 'new' ? 'New' : 'Used'} ·{' '}
                  {formatCurrency(v.purchasePrice)}
                </div>
              </button>
              <div className="mt-1.5 flex gap-1">
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                  onClick={() => duplicateVehicle(v.id)}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="rounded px-1.5 py-0.5 text-xs text-rose-600 hover:bg-rose-50"
                  onClick={() => removeVehicle(v.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          )
        })}
        {vehicles.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-sm text-slate-500">
            No vehicles yet. Add one from a segment preset.
          </li>
        )}
      </ul>
    </Card>
  )
}

export function VehicleForm() {
  const vehicle = useGarage((s) =>
    s.vehicles.find((v) => v.id === s.selectedVehicleId),
  )
  const updateVehicle = useGarage((s) => s.updateVehicle)

  if (!vehicle) {
    return (
      <Card title="Vehicle details">
        <p className="text-sm text-slate-500">Select or add a vehicle to edit.</p>
      </Card>
    )
  }

  const patch = (p: Partial<Vehicle>) => updateVehicle(vehicle.id, p)

  const applySegment = (segment: Segment) => {
    const preset = getPreset(segment)
    const { typicalNewPrice, ...defaults } = preset.defaults
    patch({
      segment,
      purchasePrice:
        vehicle.condition === 'new'
          ? typicalNewPrice
          : vehicle.purchasePrice,
      ...defaults,
    })
  }

  return (
    <Card
      title="Vehicle details"
      description="Edit purchase, operating costs, and financing. Segment presets refill typical curves."
    >
      <div className="space-y-5">
        <FieldGrid>
          <Input
            label="Display name"
            value={vehicle.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="sm:col-span-2"
          />
          <Input
            label="Chart color"
            type="color"
            value={vehicle.color}
            onChange={(e) => patch({ color: e.target.value })}
          />
          <Input
            label="Year"
            type="number"
            value={vehicle.year}
            onChange={(e) => patch({ year: Number(e.target.value) })}
          />
          <Input
            label="Make"
            value={vehicle.make}
            onChange={(e) => patch({ make: e.target.value })}
          />
          <Input
            label="Model"
            value={vehicle.model}
            onChange={(e) => patch({ model: e.target.value })}
          />
          <Select
            label="Condition"
            value={vehicle.condition}
            onChange={(e) => {
              const condition = e.target.value as Condition
              patch({
                condition,
                purchaseAgeYears: condition === 'new' ? 0 : Math.max(1, vehicle.purchaseAgeYears),
                purchaseKm: condition === 'new' ? 0 : Math.max(1, vehicle.purchaseKm),
              })
            }}
          >
            <option value="new">New</option>
            <option value="used">Used</option>
          </Select>
          <Select
            label="Segment preset"
            value={vehicle.segment}
            onChange={(e) => applySegment(e.target.value as Segment)}
          >
            {SEGMENT_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
          <Input
            label="Purchase price"
            type="number"
            min={0}
            step={100}
            value={vehicle.purchasePrice}
            onChange={(e) => patch({ purchasePrice: Number(e.target.value) })}
          />
          <Input
            label="Age at purchase (years)"
            type="number"
            min={0}
            step={0.5}
            value={vehicle.purchaseAgeYears}
            onChange={(e) => patch({ purchaseAgeYears: Number(e.target.value) })}
          />
          <Input
            label="Kilometres at purchase"
            type="number"
            min={0}
            step={100}
            value={vehicle.purchaseKm}
            onChange={(e) => patch({ purchaseKm: Number(e.target.value) })}
          />
        </FieldGrid>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">Energy</legend>
          <FieldGrid>
            <Select
              label="Powertrain"
              value={vehicle.energy.powertrain}
              onChange={(e) =>
                patch({
                  energy: {
                    ...vehicle.energy,
                    powertrain: e.target.value as Powertrain,
                    efficiency:
                      e.target.value === 'electric'
                        ? 5.6
                        : e.target.value === 'hybrid'
                          ? 4.9
                          : 8.4,
                  },
                })
              }
            >
              <option value="gas">Gas</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </Select>
            <Input
              label={
                vehicle.energy.powertrain === 'electric'
                  ? 'Efficiency (km/kWh)'
                  : 'Efficiency (L/100km)'
              }
              type="number"
              min={0.1}
              step={0.1}
              value={vehicle.energy.efficiency}
              onChange={(e) =>
                patch({
                  energy: { ...vehicle.energy, efficiency: Number(e.target.value) },
                })
              }
            />
          </FieldGrid>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">Insurance</legend>
          <FieldGrid>
            <Input
              label="Year 1 premium"
              type="number"
              min={0}
              value={vehicle.insurance.year1Premium}
              onChange={(e) =>
                patch({
                  insurance: {
                    ...vehicle.insurance,
                    year1Premium: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Annual decline (%)"
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={Number((vehicle.insurance.annualDeclineRate * 100).toFixed(2))}
              onChange={(e) =>
                patch({
                  insurance: {
                    ...vehicle.insurance,
                    annualDeclineRate: Number(e.target.value) / 100,
                  },
                })
              }
            />
            <Input
              label="Floor premium"
              type="number"
              min={0}
              value={vehicle.insurance.floorPremium}
              onChange={(e) =>
                patch({
                  insurance: {
                    ...vehicle.insurance,
                    floorPremium: Number(e.target.value),
                  },
                })
              }
            />
          </FieldGrid>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">
            Maintenance & warranty
          </legend>
          <FieldGrid>
            <Input
              label="Annual routine"
              type="number"
              min={0}
              value={vehicle.maintenance.annualRoutine}
              onChange={(e) =>
                patch({
                  maintenance: {
                    ...vehicle.maintenance,
                    annualRoutine: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Base repairs / yr"
              type="number"
              min={0}
              value={vehicle.maintenance.baseRepairs}
              onChange={(e) =>
                patch({
                  maintenance: {
                    ...vehicle.maintenance,
                    baseRepairs: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Repair growth / age yr"
              type="number"
              min={0}
              value={vehicle.maintenance.repairGrowthPerYear}
              onChange={(e) =>
                patch({
                  maintenance: {
                    ...vehicle.maintenance,
                    repairGrowthPerYear: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Warranty years"
              type="number"
              min={0}
              value={vehicle.maintenance.warrantyYears}
              onChange={(e) =>
                patch({
                  maintenance: {
                    ...vehicle.maintenance,
                    warrantyYears: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Warranty kilometres"
              type="number"
              min={0}
              step={1000}
              value={vehicle.maintenance.warrantyKm}
              onChange={(e) =>
                patch({
                  maintenance: {
                    ...vehicle.maintenance,
                    warrantyKm: Number(e.target.value),
                  },
                })
              }
            />
          </FieldGrid>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">
            Taxes & fees
          </legend>
          <FieldGrid>
            <Input
              label="Sales tax (%)"
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={Number((vehicle.fees.salesTaxRate * 100).toFixed(2))}
              onChange={(e) =>
                patch({
                  fees: { ...vehicle.fees, salesTaxRate: Number(e.target.value) / 100 },
                })
              }
            />
            <Input
              label="Doc / title fees"
              type="number"
              min={0}
              value={vehicle.fees.docTitleFees}
              onChange={(e) =>
                patch({
                  fees: { ...vehicle.fees, docTitleFees: Number(e.target.value) },
                })
              }
            />
            <Input
              label="Annual registration"
              type="number"
              min={0}
              value={vehicle.fees.annualRegistration}
              onChange={(e) =>
                patch({
                  fees: {
                    ...vehicle.fees,
                    annualRegistration: Number(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Property tax (% of value)"
              type="number"
              min={0}
              max={10}
              step={0.05}
              value={Number((vehicle.fees.propertyTaxRate * 100).toFixed(2))}
              onChange={(e) =>
                patch({
                  fees: {
                    ...vehicle.fees,
                    propertyTaxRate: Number(e.target.value) / 100,
                  },
                })
              }
            />
          </FieldGrid>
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">Financing</legend>
          <Toggle
            label="Finance this vehicle"
            checked={vehicle.financing.enabled}
            onChange={(enabled) =>
              patch({ financing: { ...vehicle.financing, enabled } })
            }
          />
          {vehicle.financing.enabled && (
            <FieldGrid>
              <Input
                label="Down payment"
                type="number"
                min={0}
                value={vehicle.financing.downPayment}
                onChange={(e) =>
                  patch({
                    financing: {
                      ...vehicle.financing,
                      downPayment: Number(e.target.value),
                    },
                  })
                }
              />
              <Input
                label="APR (%)"
                type="number"
                min={0}
                max={30}
                step={0.1}
                value={Number((vehicle.financing.annualRate * 100).toFixed(2))}
                onChange={(e) =>
                  patch({
                    financing: {
                      ...vehicle.financing,
                      annualRate: Number(e.target.value) / 100,
                    },
                  })
                }
              />
              <Input
                label="Term (months)"
                type="number"
                min={0}
                step={6}
                value={vehicle.financing.termMonths}
                onChange={(e) =>
                  patch({
                    financing: {
                      ...vehicle.financing,
                      termMonths: Number(e.target.value),
                    },
                  })
                }
              />
            </FieldGrid>
          )}
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <legend className="px-1 text-sm font-semibold text-slate-800">
            Depreciation curve
          </legend>
          <FieldGrid>
            <Input
              label="Year-1 loss (%)"
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={Number(((vehicle.depreciation.lossRates[0] ?? 0.2) * 100).toFixed(1))}
              onChange={(e) => {
                const rates = [...vehicle.depreciation.lossRates]
                rates[0] = Number(e.target.value) / 100
                patch({ depreciation: { ...vehicle.depreciation, lossRates: rates } })
              }}
            />
            <Input
              label="Tail annual loss (%)"
              type="number"
              min={0}
              max={30}
              step={0.5}
              value={Number((vehicle.depreciation.tailRate * 100).toFixed(1))}
              onChange={(e) =>
                patch({
                  depreciation: {
                    ...vehicle.depreciation,
                    tailRate: Number(e.target.value) / 100,
                  },
                })
              }
            />
            <Input
              label="Value floor (% of new)"
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={Number((vehicle.depreciation.floorFraction * 100).toFixed(1))}
              onChange={(e) =>
                patch({
                  depreciation: {
                    ...vehicle.depreciation,
                    floorFraction: Number(e.target.value) / 100,
                  },
                })
              }
            />
          </FieldGrid>
          <p className="text-xs text-slate-500">
            Used cars are anchored so residual at purchase age equals purchase price,
            then follow the same curve — they typically lose less per year than new.
          </p>
        </fieldset>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => applySegment(vehicle.segment)}
          >
            Reset costs from segment preset
          </Button>
        </div>
      </div>
    </Card>
  )
}
