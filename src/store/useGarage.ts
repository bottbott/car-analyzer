import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createSampleVehicles,
  createVehicleFromPreset,
  DEFAULT_ASSUMPTIONS,
} from '@/domain/presets'
import type { GlobalAssumptions, Segment, Vehicle } from '@/domain/types'
import { parseGarageImport, buildExport } from '@/lib/io'

interface GarageState {
  assumptions: GlobalAssumptions
  vehicles: Vehicle[]
  selectedVehicleId: string | null
  setAssumptions: (patch: Partial<GlobalAssumptions>) => void
  addVehicle: (segment?: Segment) => void
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void
  removeVehicle: (id: string) => void
  duplicateVehicle: (id: string) => void
  selectVehicle: (id: string | null) => void
  replaceAll: (assumptions: GlobalAssumptions, vehicles: Vehicle[]) => void
  resetSamples: () => void
  importJson: (raw: string) => void
  toExportJson: () => string
}

export const useGarage = create<GarageState>()(
  persist(
    (set, get) => {
      const samples = createSampleVehicles()
      return {
        assumptions: { ...DEFAULT_ASSUMPTIONS },
        vehicles: samples,
        selectedVehicleId: samples[0]?.id ?? null,

        setAssumptions: (patch) =>
          set((s) => ({ assumptions: { ...s.assumptions, ...patch } })),

        addVehicle: (segment = 'sedan') => {
          const vehicle = createVehicleFromPreset(segment)
          set((s) => ({
            vehicles: [...s.vehicles, vehicle],
            selectedVehicleId: vehicle.id,
          }))
        },

        updateVehicle: (id, patch) =>
          set((s) => ({
            vehicles: s.vehicles.map((v) => {
              if (v.id !== id) return v
              return {
                ...v,
                ...patch,
                depreciation: { ...v.depreciation, ...patch.depreciation },
                insurance: { ...v.insurance, ...patch.insurance },
                maintenance: { ...v.maintenance, ...patch.maintenance },
                energy: { ...v.energy, ...patch.energy },
                fees: { ...v.fees, ...patch.fees },
                financing: { ...v.financing, ...patch.financing },
              }
            }),
          })),

        removeVehicle: (id) =>
          set((s) => {
            const vehicles = s.vehicles.filter((v) => v.id !== id)
            const selectedVehicleId =
              s.selectedVehicleId === id
                ? (vehicles[0]?.id ?? null)
                : s.selectedVehicleId
            return { vehicles, selectedVehicleId }
          }),

        duplicateVehicle: (id) => {
          const source = get().vehicles.find((v) => v.id === id)
          if (!source) return
          const copy: Vehicle = {
            ...structuredClone(source),
            id: `veh_${crypto.randomUUID().slice(0, 8)}`,
            name: `${source.name} (copy)`,
          }
          set((s) => ({
            vehicles: [...s.vehicles, copy],
            selectedVehicleId: copy.id,
          }))
        },

        selectVehicle: (id) => set({ selectedVehicleId: id }),

        replaceAll: (assumptions, vehicles) =>
          set({
            assumptions,
            vehicles,
            selectedVehicleId: vehicles[0]?.id ?? null,
          }),

        resetSamples: () => {
          const vehicles = createSampleVehicles()
          set({
            assumptions: { ...DEFAULT_ASSUMPTIONS },
            vehicles,
            selectedVehicleId: vehicles[0]?.id ?? null,
          })
        },

        importJson: (raw) => {
          const data = parseGarageImport(raw)
          set({
            assumptions: data.assumptions,
            vehicles: data.vehicles,
            selectedVehicleId: data.vehicles[0]?.id ?? null,
          })
        },

        toExportJson: () => {
          const { assumptions, vehicles } = get()
          return JSON.stringify(buildExport(assumptions, vehicles), null, 2)
        },
      }
    },
    {
      name: 'car-analyzer-garage-v2',
      partialize: (s) => ({
        assumptions: s.assumptions,
        vehicles: s.vehicles,
        selectedVehicleId: s.selectedVehicleId,
      }),
    },
  ),
)
