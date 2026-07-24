export const ENDPOINTS = {
  auth: {
    register: '/candidate/auth/register',
    login:    '/candidate/auth/login',
    checkCpf: '/candidate/auth/check-cpf'
  },

  onboarding: {
    interests:  '/onboarding/interests',
    priorities: '/onboarding/priorities',

    sectors: (search?: string) =>
      `/onboarding/sectors${search ? `?search=${encodeURIComponent(search)}` : ''}`,

    positions: (sectorId: number, search?: string) =>
      `/onboarding/positions?sectorId=${sectorId}${
        search ? `&search=${encodeURIComponent(search)}` : ''
      }`,

    complete: '/onboarding/complete',
  },

  candidates: {
    me:           '/candidates/me',
    uploadAvatar: '/candidates/avatar',
  },

  jobs: {
    list:   '/candidate/jobs',
    detail: (id: number) => `/candidate/jobs/${id}`,
    apply:  (id: number) => `/candidate/jobs/${id}/apply`,
  },
};