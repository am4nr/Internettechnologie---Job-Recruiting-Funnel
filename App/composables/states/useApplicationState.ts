// composables/states/useApplicationState.ts
import type { Application } from '~/types/auth'

export const useApplicationState = () => {
  return {
    applications: useState<Application[]>('applications', () => []),
    lastFetched: useState<number>('applicationsLastFetched', () => 0)
  }
}