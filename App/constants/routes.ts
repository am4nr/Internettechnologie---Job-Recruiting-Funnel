// constants/routes.ts
export const ROUTES = {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      CONFIRM: '/auth/confirm'
    },
    JOBS: {
      SEARCH: '/jobs/search',
      APPLY: '/jobs/apply'
    }
  } as const