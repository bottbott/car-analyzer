import { AppHeader } from '@/components/layout/AppHeader'
import { AssumptionsPanel } from '@/components/assumptions/AssumptionsPanel'
import { VehicleForm, VehicleSidebar } from '@/components/vehicles/VehicleForm'
import {
  AnnualCostChart,
  CostBreakdownChart,
  CumulativeTcoChart,
  ResaleValueChart,
} from '@/components/charts/Charts'
import { ComparisonTable, YearByYearTable } from '@/components/tables/Tables'
import { useComparison } from '@/components/charts/useComparison'
import { formatCurrency } from '@/lib/format'

function SummaryStrip() {
  const { projections, cheapestId } = useComparison()
  const cheapest = projections.find((p) => p.vehicleId === cheapestId)

  if (projections.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {projections.slice(0, 3).map((p) => (
        <div
          key={p.vehicleId}
          className={`rounded-2xl border bg-white p-4 shadow-sm ${
            p.vehicleId === cheapestId
              ? 'border-teal-600 ring-1 ring-teal-600/30'
              : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <p className="truncate text-sm font-semibold text-slate-900">
              {p.vehicleName}
            </p>
          </div>
          <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            {formatCurrency(p.totalEconomicTco)}
          </p>
          <p className="text-xs text-slate-500">
            {formatCurrency(p.averageMonthly)}/mo · {formatCurrency(p.costPerKm, 2)}/km
          </p>
        </div>
      ))}
      {cheapest && projections.length > 3 && (
        <p className="sm:col-span-3 text-xs text-slate-500">
          Showing top 3 of {projections.length}. Lowest TCO:{' '}
          <span className="font-semibold text-teal-800">{cheapest.vehicleName}</span>.
        </p>
      )}
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <VehicleSidebar />
          <AssumptionsPanel />
        </aside>
        <div className="space-y-6">
          <SummaryStrip />
          <CumulativeTcoChart />
          <div className="grid gap-6 xl:grid-cols-2">
            <CostBreakdownChart />
            <ResaleValueChart />
          </div>
          <AnnualCostChart />
          <ComparisonTable />
          <YearByYearTable />
          <VehicleForm />
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white/60 py-4 text-center text-xs text-slate-500">
        Local-only · data stays in your browser · economic TCO uses depreciation +
        operating costs + interest (not principal)
      </footer>
    </div>
  )
}
