import { useMemo } from 'react'
import { compareVehicles } from '@/domain/engine'
import { useGarage } from '@/store/useGarage'

export function useComparison() {
  const vehicles = useGarage((s) => s.vehicles)
  const assumptions = useGarage((s) => s.assumptions)

  return useMemo(
    () => compareVehicles(vehicles, assumptions),
    [vehicles, assumptions],
  )
}
