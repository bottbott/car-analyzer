import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/lib/format'
import { useComparison } from './useComparison'
import { useGarage } from '@/store/useGarage'

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  fontSize: 12,
}

function currencyTick(value: number) {
  if (Math.abs(value) >= 1000) return `$${Math.round(value / 1000)}k`
  return `$${value}`
}

export function CumulativeTcoChart() {
  const { projections, breakevens } = useComparison()

  const data = Array.from(
    { length: projections[0]?.years.length ?? 0 },
    (_, i) => {
      const row: Record<string, number | string> = { year: `Y${i + 1}` }
      for (const p of projections) {
        row[p.vehicleId] = Math.round(p.years[i]?.cumulativeEconomic ?? 0)
      }
      return row
    },
  )

  const notes = breakevens
    .filter((b) => b.year != null)
    .map(
      (b) =>
        `${b.vehicleAName} vs ${b.vehicleBName}: ranking flips in year ${b.year}`,
    )

  return (
    <Card
      title="Cumulative TCO"
      description="Economic ownership cost over time. Crossovers show when a cheaper-upfront car loses its lead."
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={currencyTick} tick={{ fontSize: 12 }} width={48} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            {projections.map((p) => (
              <Line
                key={p.vehicleId}
                type="monotone"
                dataKey={p.vehicleId}
                name={p.vehicleName}
                stroke={p.color}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {notes.map((n) => (
            <li key={n} className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-amber-900">
              Breakeven — {n}
            </li>
          ))}
        </ul>
      )}
      {notes.length === 0 && projections.length >= 2 && (
        <p className="mt-3 text-xs text-slate-500">
          No ranking flips within this horizon — the year-1 leader stays ahead.
        </p>
      )}
    </Card>
  )
}

const BREAKDOWN_KEYS = [
  { key: 'depreciation', label: 'Depreciation', color: '#0f766e' },
  { key: 'insurance', label: 'Insurance', color: '#2563eb' },
  { key: 'energy', label: 'Energy', color: '#ca8a04' },
  { key: 'routineMaintenance', label: 'Routine maint.', color: '#16a34a' },
  { key: 'repairs', label: 'Repairs', color: '#dc2626' },
  { key: 'loanInterest', label: 'Loan interest', color: '#7c3aed' },
  { key: 'fees', label: 'Tax & fees', color: '#64748b' },
] as const

export function CostBreakdownChart() {
  const { projections } = useComparison()

  const data = projections.map((p) => ({
    name: p.vehicleName,
    depreciation: Math.round(p.totals.depreciation),
    insurance: Math.round(p.totals.insurance),
    energy: Math.round(p.totals.energy),
    routineMaintenance: Math.round(p.totals.routineMaintenance),
    repairs: Math.round(p.totals.repairs),
    loanInterest: Math.round(p.totals.loanInterest),
    fees: Math.round(
      p.totals.salesTax +
        p.totals.upfrontFees +
        p.totals.registration +
        p.totals.propertyTax,
    ),
  }))

  return (
    <Card
      title="Cost breakdown"
      description="Where the money goes over the full horizon."
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
            <YAxis tickFormatter={currencyTick} tick={{ fontSize: 12 }} width={48} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            {BREAKDOWN_KEYS.map((k) => (
              <Bar
                key={k.key}
                dataKey={k.key}
                name={k.label}
                stackId="a"
                fill={k.color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function ResaleValueChart() {
  const { projections } = useComparison()
  const selectedId = useGarage((s) => s.selectedVehicleId)
  const selected =
    projections.find((p) => p.vehicleId === selectedId) ?? projections[0]

  if (!selected) {
    return (
      <Card title="Resale value">
        <p className="text-sm text-slate-500">Add a vehicle to see residual value.</p>
      </Card>
    )
  }

  const data = selected.years.map((y) => ({
    year: `Y${y.yearIndex}`,
    residual: Math.round(y.residualValue),
    loan: Math.round(y.loanBalance),
  }))

  return (
    <Card
      title={`Resale value — ${selected.vehicleName}`}
      description="Residual vs remaining loan. When the loan line is above residual, you're underwater."
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={currencyTick} tick={{ fontSize: 12 }} width={48} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="residual"
              name="Resale value"
              stroke={selected.color}
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="loan"
              name="Loan balance"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function AnnualCostChart() {
  const { projections } = useComparison()
  const selectedId = useGarage((s) => s.selectedVehicleId)
  const selected =
    projections.find((p) => p.vehicleId === selectedId) ?? projections[0]

  if (!selected) {
    return (
      <Card title="Annual cost">
        <p className="text-sm text-slate-500">Add a vehicle to see annual costs.</p>
      </Card>
    )
  }

  const data = selected.years.map((y) => ({
    year: `Y${y.yearIndex}`,
    depreciation: Math.round(y.depreciation),
    insurance: Math.round(y.insurance),
    energy: Math.round(y.energy),
    maintenance: Math.round(y.routineMaintenance + y.repairs),
    interest: Math.round(y.loanInterest),
    fees: Math.round(
      y.registration + y.propertyTax + y.salesTax + y.upfrontFees,
    ),
  }))

  return (
    <Card
      title={`Annual cost — ${selected.vehicleName}`}
      description="Year-by-year economic cost stack. Watch insurance fall and repairs rise."
    >
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={currencyTick} tick={{ fontSize: 12 }} width={48} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => formatCurrency(Number(value))}
            />
            <Legend />
            <Bar dataKey="depreciation" name="Depreciation" stackId="a" fill="#0f766e" />
            <Bar dataKey="insurance" name="Insurance" stackId="a" fill="#2563eb" />
            <Bar dataKey="energy" name="Energy" stackId="a" fill="#ca8a04" />
            <Bar dataKey="maintenance" name="Maint. & repairs" stackId="a" fill="#16a34a" />
            <Bar dataKey="interest" name="Interest" stackId="a" fill="#7c3aed" />
            <Bar dataKey="fees" name="Tax & fees" stackId="a" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
