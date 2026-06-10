export const ENDPOINTS = {
  auth: {
    register: '/candidate/auth/register',
    login:    '/candidate/auth/login',
  },

  onboarding: {
    interests:  '/onboarding/interests',
    priorities: '/onboarding/priorities',
    complete:   '/onboarding/complete',
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