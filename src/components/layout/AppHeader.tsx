import { useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { exportGarageJson } from '@/lib/io'
import { useGarage } from '@/store/useGarage'

export function AppHeader() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const assumptions = useGarage((s) => s.assumptions)
  const vehicles = useGarage((s) => s.vehicles)
  const importJson = useGarage((s) => s.importJson)
  const resetSamples = useGarage((s) => s.resetSamples)

  const onImport = async (file: File | undefined) => {
    if (!file) return
    try {
      const text = await file.text()
      importJson(text)
      setMessage(`Imported ${file.name}`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed')
    }
  }

  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">
            Car Analyzer
          </p>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Vehicle total cost of ownership
          </h1>
          <p className="mt-0.5 max-w-2xl text-sm text-slate-500">
            Compare new and used cars across depreciation, insurance, maintenance,
            energy, financing, and fees — all stored locally in your browser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => exportGarageJson(assumptions, vehicles)}
          >
            Export JSON
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            Import JSON
          </Button>
          <Button type="button" variant="ghost" onClick={() => resetSamples()}>
            Reset samples
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onImport(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {message && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-xs text-slate-600 sm:px-6">
          {message}
          <button
            type="button"
            className="ml-2 text-teal-700 underline"
            onClick={() => setMessage(null)}
          >
            dismiss
          </button>
        </div>
      )}
    </header>
  )
}
