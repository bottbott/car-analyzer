import { useMemo, useState } from 'react'
import type { VehicleProjection } from '@/domain/types'
import { Card, Button, Select } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/format'
import { downloadTextFile, toCsv } from '@/lib/csv'
import { useComparison } from '@/components/charts/useComparison'
import { useGarage } from '@/store/useGarage'
import { cashFlowTco } from '@/domain/engine'

type SortKey =
  | 'name'
  | 'tco'
  | 'monthly'
  | 'perKm'
  | 'depreciation'
  | 'insurance'
  | 'energy'
  | 'maintenance'
  | 'interest'
  | 'fees'
  | 'residual'

function bestIds(
  projections: VehicleProjection[],
  getter: (p: VehicleProjection) => number,
  higherIsBetter = false,
): Set<string> {
  if (projections.length === 0) return new Set()
  const values = projections.map(getter)
  const target = higherIsBetter ? Math.max(...values) : Math.min(...values)
  return new Set(
    projections.filter((p) => getter(p) === target).map((p) => p.vehicleId),
  )
}

function SortHeader({
  label,
  column,
  sortKey,
  asc,
  onSort,
  align = 'right',
}: {
  label: string
  column: SortKey
  sortKey: SortKey
  asc: boolean
  onSort: (key: SortKey) => void
  align?: 'left' | 'right'
}) {
  return (
    <th className={`px-2 py-2 font-semibold ${align === 'left' ? 'text-left' : 'text-right'}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-teal-800"
      >
        {label}
        {sortKey === column && <span aria-hidden>{asc ? '↑' : '↓'}</span>}
      </button>
    </th>
  )
}

export function ComparisonTable() {
  const { projections, cheapestId } = useComparison()
  const [sortKey, setSortKey] = useState<SortKey>('tco')
  const [asc, setAsc] = useState(true)

  const highlights = useMemo(() => {
    return {
      tco: bestIds(projections, (p) => p.totalEconomicTco),
      monthly: bestIds(projections, (p) => p.averageMonthly),
      perKm: bestIds(projections, (p) => p.costPerKm),
      depreciation: bestIds(projections, (p) => p.totals.depreciation),
      insurance: bestIds(projections, (p) => p.totals.insurance),
      energy: bestIds(projections, (p) => p.totals.energy),
      maintenance: bestIds(projections, (p) =>
        p.totals.routineMaintenance + p.totals.repairs,
      ),
      interest: bestIds(projections, (p) => p.totals.loanInterest),
      fees: bestIds(projections, (p) =>
        p.totals.salesTax +
          p.totals.upfrontFees +
          p.totals.registration +
          p.totals.propertyTax,
      ),
      residual: bestIds(projections, (p) => p.endResidualValue, true),
    }
  }, [projections])

  const sorted = useMemo(() => {
    const copy = [...projections]
    const dir = asc ? 1 : -1
    copy.sort((a, b) => {
      const getter = (p: VehicleProjection): number | string => {
        switch (sortKey) {
          case 'name':
            return p.vehicleName.toLowerCase()
          case 'tco':
            return p.totalEconomicTco
          case 'monthly':
            return p.averageMonthly
          case 'perKm':
            return p.costPerKm
          case 'depreciation':
            return p.totals.depreciation
          case 'insurance':
            return p.totals.insurance
          case 'energy':
            return p.totals.energy
          case 'maintenance':
            return p.totals.routineMaintenance + p.totals.repairs
          case 'interest':
            return p.totals.loanInterest
          case 'fees':
            return (
              p.totals.salesTax +
              p.totals.upfrontFees +
              p.totals.registration +
              p.totals.propertyTax
            )
          case 'residual':
            return p.endResidualValue
        }
      }
      const av = getter(a)
      const bv = getter(b)
      if (typeof av === 'string' && typeof bv === 'string') {
        return av.localeCompare(bv) * dir
      }
      return (Number(av) - Number(bv)) * dir
    })
    return copy
  }, [projections, sortKey, asc])

  const onSort = (key: SortKey) => {
    if (sortKey === key) setAsc(!asc)
    else {
      setSortKey(key)
      setAsc(key !== 'residual' && key !== 'name')
    }
  }

  const exportCsv = () => {
    const headers = [
      'Vehicle',
      'Total TCO',
      '$/month',
      '$/km',
      'Depreciation',
      'Insurance',
      'Energy',
      'Maintenance',
      'Interest',
      'Tax & fees',
      'End residual',
      'End equity',
      'Cash-flow TCO',
    ]
    const rows = sorted.map((p) => [
      p.vehicleName,
      Math.round(p.totalEconomicTco),
      Math.round(p.averageMonthly),
      p.costPerKm.toFixed(3),
      Math.round(p.totals.depreciation),
      Math.round(p.totals.insurance),
      Math.round(p.totals.energy),
      Math.round(p.totals.routineMaintenance + p.totals.repairs),
      Math.round(p.totals.loanInterest),
      Math.round(
        p.totals.salesTax +
          p.totals.upfrontFees +
          p.totals.registration +
          p.totals.propertyTax,
      ),
      Math.round(p.endResidualValue),
      Math.round(p.endEquity),
      Math.round(cashFlowTco(p)),
    ])
    downloadTextFile(
      'vehicle-tco-comparison.csv',
      toCsv(headers, rows),
      'text/csv;charset=utf-8',
    )
  }

  const cell = (id: string, set: Set<string>, value: string) => (
    <td
      className={`px-2 py-2 text-right tabular-nums ${
        set.has(id) ? 'bg-teal-50 font-semibold text-teal-900' : ''
      }`}
    >
      {value}
    </td>
  )

  const headerProps = { sortKey, asc, onSort }

  return (
    <Card
      title="Comparison summary"
      description="Best value in each column is highlighted. Sort any column."
      actions={
        <Button type="button" variant="secondary" onClick={exportCsv} disabled={sorted.length === 0}>
          Export CSV
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <SortHeader label="Vehicle" column="name" align="left" {...headerProps} />
              <SortHeader label="Total TCO" column="tco" {...headerProps} />
              <SortHeader label="$/mo" column="monthly" {...headerProps} />
              <SortHeader label="$/km" column="perKm" {...headerProps} />
              <SortHeader label="Deprec." column="depreciation" {...headerProps} />
              <SortHeader label="Insurance" column="insurance" {...headerProps} />
              <SortHeader label="Energy" column="energy" {...headerProps} />
              <SortHeader label="Maint." column="maintenance" {...headerProps} />
              <SortHeader label="Interest" column="interest" {...headerProps} />
              <SortHeader label="Tax/fees" column="fees" {...headerProps} />
              <SortHeader label="Residual" column="residual" {...headerProps} />
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr
                key={p.vehicleId}
                className={`border-b border-slate-100 ${
                  p.vehicleId === cheapestId ? 'bg-teal-50/40' : ''
                }`}
              >
                <td className="px-2 py-2 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <span className="font-medium text-slate-900">{p.vehicleName}</span>
                    {p.vehicleId === cheapestId && (
                      <span className="rounded-full bg-teal-700 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        Best
                      </span>
                    )}
                  </div>
                </td>
                {cell(p.vehicleId, highlights.tco, formatCurrency(p.totalEconomicTco))}
                {cell(p.vehicleId, highlights.monthly, formatCurrency(p.averageMonthly))}
                {cell(
                  p.vehicleId,
                  highlights.perKm,
                  formatCurrency(p.costPerKm, 2),
                )}
                {cell(
                  p.vehicleId,
                  highlights.depreciation,
                  formatCurrency(p.totals.depreciation),
                )}
                {cell(
                  p.vehicleId,
                  highlights.insurance,
                  formatCurrency(p.totals.insurance),
                )}
                {cell(p.vehicleId, highlights.energy, formatCurrency(p.totals.energy))}
                {cell(
                  p.vehicleId,
                  highlights.maintenance,
                  formatCurrency(p.totals.routineMaintenance + p.totals.repairs),
                )}
                {cell(
                  p.vehicleId,
                  highlights.interest,
                  formatCurrency(p.totals.loanInterest),
                )}
                {cell(
                  p.vehicleId,
                  highlights.fees,
                  formatCurrency(
                    p.totals.salesTax +
                      p.totals.upfrontFees +
                      p.totals.registration +
                      p.totals.propertyTax,
                  ),
                )}
                {cell(
                  p.vehicleId,
                  highlights.residual,
                  formatCurrency(p.endResidualValue),
                )}
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={11} className="px-2 py-8 text-center text-slate-500">
                  Add vehicles to compare total cost of ownership.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export function YearByYearTable() {
  const { projections } = useComparison()
  const selectedId = useGarage((s) => s.selectedVehicleId)
  const selectVehicle = useGarage((s) => s.selectVehicle)
  const selected =
    projections.find((p) => p.vehicleId === selectedId) ?? projections[0]

  if (!selected) {
    return (
      <Card title="Year-by-year detail">
        <p className="text-sm text-slate-500">Select a vehicle to inspect annual rows.</p>
      </Card>
    )
  }

  return (
    <Card
      title="Year-by-year detail"
      description="Full economic cost rows for the selected vehicle."
      actions={
        <Select
          value={selected.vehicleId}
          onChange={(e) => selectVehicle(e.target.value)}
          aria-label="Vehicle for year detail"
          className="min-w-[12rem]"
        >
          {projections.map((p) => (
            <option key={p.vehicleId} value={p.vehicleId}>
              {p.vehicleName}
            </option>
          ))}
        </Select>
      }
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {[
                'Year',
                'Age',
                'Km',
                'Deprec.',
                'Insurance',
                'Energy',
                'Maint.',
                'Repairs',
                'Interest',
                'Fees',
                'Annual',
                'Cumulative',
                'Residual',
                'Loan',
              ].map((h) => (
                <th key={h} className="px-2 py-2 text-right first:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selected.years.map((y) => (
              <tr key={y.yearIndex} className="border-b border-slate-100">
                <td className="px-2 py-2 text-left font-medium">Y{y.yearIndex}</td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {y.vehicleAgeYears.toFixed(0)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatNumber(y.kmAtEnd)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.depreciation)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.insurance)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.energy)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.routineMaintenance)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.repairs)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.loanInterest)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(
                    y.registration + y.propertyTax + y.salesTax + y.upfrontFees,
                  )}
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-medium">
                  {formatCurrency(y.economicCost)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums font-semibold text-teal-900">
                  {formatCurrency(y.cumulativeEconomic)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.residualValue)}
                </td>
                <td className="px-2 py-2 text-right tabular-nums">
                  {formatCurrency(y.loanBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        End equity {formatCurrency(selected.endEquity)} · Cash-flow TCO{' '}
        {formatCurrency(cashFlowTco(selected))} (should match economic TCO)
      </p>
    </Card>
  )
}
