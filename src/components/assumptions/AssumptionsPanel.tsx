import { formatCurrency, formatNumber, formatPercent } from '@/lib/format'
import { useGarage } from '@/store/useGarage'
import { Card, SliderField, Input, FieldGrid } from '@/components/ui'

export function AssumptionsPanel() {
  const assumptions = useGarage((s) => s.assumptions)
  const setAssumptions = useGarage((s) => s.setAssumptions)

  return (
    <Card
      title="Global assumptions"
      description="What-if controls apply to every vehicle instantly."
    >
      <div className="space-y-4">
        <SliderField
          label="Ownership horizon"
          value={assumptions.horizonYears}
          min={1}
          max={15}
          step={1}
          display={`${assumptions.horizonYears} years`}
          onChange={(horizonYears) => setAssumptions({ horizonYears })}
        />
        <SliderField
          label="Annual kilometres"
          value={assumptions.annualKm}
          min={8_000}
          max={50_000}
          step={1_000}
          display={`${formatNumber(assumptions.annualKm)} km/yr`}
          onChange={(annualKm) => setAssumptions({ annualKm })}
        />
        <SliderField
          label="Fuel price"
          value={assumptions.fuelPricePerLitre}
          min={0.8}
          max={3}
          step={0.05}
          display={`${formatCurrency(assumptions.fuelPricePerLitre, 2)}/L`}
          onChange={(fuelPricePerLitre) => setAssumptions({ fuelPricePerLitre })}
        />
        <SliderField
          label="Electricity price"
          value={assumptions.electricityPricePerKwh}
          min={0.08}
          max={0.45}
          step={0.01}
          display={`${formatCurrency(assumptions.electricityPricePerKwh, 2)}/kWh`}
          onChange={(electricityPricePerKwh) =>
            setAssumptions({ electricityPricePerKwh })
          }
        />

        <FieldGrid>
          <Input
            label="Energy escalation (%/yr)"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={Number((assumptions.energyEscalationRate * 100).toFixed(2))}
            onChange={(e) =>
              setAssumptions({ energyEscalationRate: Number(e.target.value) / 100 })
            }
          />
          <Input
            label="Inflation (%/yr)"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={Number((assumptions.inflationRate * 100).toFixed(2))}
            onChange={(e) =>
              setAssumptions({ inflationRate: Number(e.target.value) / 100 })
            }
          />
          <Input
            label="Discount rate (%/yr)"
            type="number"
            min={0}
            max={20}
            step={0.1}
            value={Number((assumptions.discountRate * 100).toFixed(2))}
            onChange={(e) =>
              setAssumptions({ discountRate: Number(e.target.value) / 100 })
            }
          />
        </FieldGrid>
        <p className="text-xs text-slate-500">
          Current: energy {formatPercent(assumptions.energyEscalationRate)}, inflation{' '}
          {formatPercent(assumptions.inflationRate)}, discount{' '}
          {formatPercent(assumptions.discountRate)}. Discount rate converts TCO to
          present value when non-zero.
        </p>
      </div>
    </Card>
  )
}
