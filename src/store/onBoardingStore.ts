import { create } from 'zustand';

export interface OnboardingInterest {
  id: number;
  name: string;
  emoji: string;
  category: string;
}

export interface OnboardingPriority {
  id: number;
  name: string;
  icon: string;
}

export interface OnboardingEducation {
  level: string;
  institution: string;
}

export interface OnboardingExperience {
  company: string;
  position: string;
  salary?: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
}

export interface OnboardingSkill {
  name: string;
  level: string;
}

export interface OnboardingLanguage {
  language: string;
  level: string;
}

// Espelham os enums do Prisma (ContractType / ExperienceLevel)
export type ContractType = 'CLT' | 'PJ' | 'FREELANCER';
export type ExperienceLevel =
  | 'ESTAGIO'
  | 'JUNIOR'
  | 'PLENO'
  | 'SENIOR'
  | 'ESPECIALISTA';

export interface OnboardingData {
  discCompleted: boolean;

  interestIds: number[];
  priorityIds: number[];

  education: OnboardingEducation | null;

  firstJobSeeker: boolean;
  experiences: OnboardingExperience[];

  skills: OnboardingSkill[];
  languages: OnboardingLanguage[];

  avatarIndex: number | null;
  avatarUrl: string | null;

  // --- NOVO: preferências de vaga ---
  desiredSectorId: number | null;
  desiredSectorName: string;
  desiredPositionId: number | null;
  desiredPositionName: string;
  salaryMin: string;
  salaryMax: string;
  salaryNegotiable: boolean;
  contractTypes: ContractType[];
  experienceLevel: ExperienceLevel | null;
  acceptsTravel: boolean | null;

  // --- NOVO: localização ---
  city: string;
  state: string;
}

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;

  setDiscCompleted: (v: boolean) => void;
  setInterests: (ids: number[]) => void;
  setPriorities: (ids: number[]) => void;
  setEducation: (education: OnboardingEducation | null) => void;
  setFirstJobSeeker: (v: boolean) => void;
  setExperiences: (experiences: OnboardingExperience[]) => void;
  setSkills: (skills: OnboardingSkill[]) => void;
  setLanguages: (languages: OnboardingLanguage[]) => void;
  setAvatar: (index: number | null, url: string | null) => void;

  setJobPreferences: (payload: {
    desiredSectorId: number | null;
    desiredSectorName: string;
    desiredPositionId: number | null;
    desiredPositionName: string;
    salaryMin: string;
    salaryMax: string;
    salaryNegotiable: boolean;
    contractTypes: ContractType[];
    experienceLevel: ExperienceLevel | null;
    acceptsTravel: boolean | null;
  }) => void;
  setLocation: (city: string, state: string) => void;

  reset: () => void;
}

const initialData: OnboardingData = {
  discCompleted: false,
  interestIds: [],
  priorityIds: [],
  education: null,
  firstJobSeeker: false,
  experiences: [],
  skills: [],
  languages: [],
  avatarIndex: null,
  avatarUrl: null,

  desiredSectorId: null,
  desiredSectorName: '',
  desiredPositionId: null,
  desiredPositionName: '',
  salaryMin: '',
  salaryMax: '',
  salaryNegotiable: false,
  contractTypes: [],
  experienceLevel: null,
  acceptsTravel: null,

  city: '',
  state: '',
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 1,
  totalSteps: 9,
  data: initialData,

  nextStep: () =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, state.totalSteps),
    })),

  prevStep: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 1),
    })),

  goToStep: (step) => set({ currentStep: step }),

  setDiscCompleted: (v) =>
    set((state) => ({ data: { ...state.data, discCompleted: v } })),

  setInterests: (ids) =>
    set((state) => ({ data: { ...state.data, interestIds: ids } })),

  setPriorities: (ids) =>
    set((state) => ({ data: { ...state.data, priorityIds: ids } })),

  setEducation: (education) =>
    set((state) => ({ data: { ...state.data, education } })),

  setFirstJobSeeker: (v) =>
    set((state) => ({ data: { ...state.data, firstJobSeeker: v } })),

  setExperiences: (experiences) =>
    set((state) => ({ data: { ...state.data, experiences } })),

  setSkills: (skills) =>
    set((state) => ({ data: { ...state.data, skills } })),

  setLanguages: (languages) =>
    set((state) => ({ data: { ...state.data, languages } })),

  setAvatar: (index, url) =>
    set((state) => ({
      data: { ...state.data, avatarIndex: index, avatarUrl: url },
    })),

  setJobPreferences: (payload) =>
    set((state) => ({
      data: { ...state.data, ...payload },
    })),

  setLocation: (city, state_) =>
    set((state) => ({
      data: { ...state.data, city, state: state_ },
    })),

  reset: () => set({ currentStep: 1, data: initialData }),
}));