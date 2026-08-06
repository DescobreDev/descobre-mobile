export const ENDPOINTS = {
  auth: {
    register: '/candidate/auth/register',
    login: '/candidate/auth/login',
    checkCpf: '/candidate/auth/check-cpf'
  },

  onboarding: {
    interests: '/onboarding/interests',
    priorities: '/onboarding/priorities',
    sectors: (search?: string) =>
      `/onboarding/sectors${search ? `?search=${encodeURIComponent(search)}` : ''}`,
    positions: (sectorId: number, search?: string) =>
      `/onboarding/positions?sectorId=${sectorId}${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    complete: '/onboarding/complete',
  },

  profile: {
    get: '/candidate/profile',
    update: '/candidate/profile',
    updatePreferences: '/candidate/profile/preferences',
    updateInterests: '/candidate/profile/interests',
    updatePriorities: '/candidate/profile/priorities',
  },

  resume: {
    get: '/candidate/resume',
    upsertEducation: '/candidate/resume/education',
    addExperience: '/candidate/resume/experiences',
    updateExperience: (id: number) => `/candidate/resume/experiences/${id}`,
    removeExperience: (id: number) => `/candidate/resume/experiences/${id}`,
    addSkill: '/candidate/resume/skills',
    removeSkill: (id: number) => `/candidate/resume/skills/${id}`,
    addLanguage: '/candidate/resume/languages',
    removeLanguage: (id: number) => `/candidate/resume/languages/${id}`,
  },

  jobs: {
    list: '/candidate/jobs',
    detail: (id: number) => `/candidate/jobs/${id}`,
    apply: (id: number) => `/candidate/jobs/${id}/apply`,
    sectors: '/candidate/jobs/filters/sectors',
    benefits: '/candidate/jobs/filters/benefits',
    positionsBySector: (sectorId: number) => `/candidate/jobs/filters/sectors/${sectorId}/positions`
  },
};