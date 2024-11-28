// composables/states/useUserState.ts
import type { UserWithRole } from '~/types/auth'

export const useUserState = () => {
  return {
    users: useState<UserWithRole[]>('users', () => []),
    lastFetched: useState<number>('usersLastFetched', () => 0)
  }
}