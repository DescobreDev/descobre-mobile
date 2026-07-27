export type WorkFormat = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type ContractType = 'CLT' | 'PJ' | 'FREELANCER';
export type JobType = 'STANDARD' | 'INTERNSHIP' | 'TRAINEE';
export type ExperienceLevel = 'ESTAGIO' | 'JUNIOR' | 'PLENO' | 'SENIOR' | 'ESPECIALISTA';
export type AffirmativeType = 'NOT_INFORMED' | 'PCD' | 'WOMEN' | 'FIFTY_PLUS' | 'LGBTQIAPN';

export interface JobCompany {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
}

export interface JobListItem {
  id: number;
  title: string;
  description: string;
  salary: number | null;
  workFormat: WorkFormat;
  contractType: ContractType;
  jobType: JobType;
  experienceLevel: ExperienceLevel | null;
  city: string | null;
  state: string | null;
  deadline: string | null;
  createdAt: string;
  company: JobCompany;
  benefits: string[];
  sectorId: number;
  positionId: number;
  alreadyApplied: boolean;
}

export interface Sector {
  id: number;
  name: string;
}

export interface Position {
  id: number;
  name: string;
}

export interface SectorWithPositions extends Sector {
  positions: Position[];
}

export interface Benefit {
  id: number;
  name: string;
}

export const ADVANCED_FILTER_KEYS = [
  'positionId',
  'jobType',
  'experienceLevel',
  'affirmative',
  'benefitIds',
  'salaryMin',
  'salaryMax',
  'city',
  'state',
] as const;

export interface JobFilters {
  search: string;
  workFormat: WorkFormat | null;
  contractType: ContractType | null;
  sectorId: number | null;
  positionId: number | null;
  jobType: JobType | null;
  experienceLevel: ExperienceLevel | null;
  affirmative: AffirmativeType | null;
  benefitIds: number[];
  salaryMin: number | null;
  salaryMax: number | null;
  city: string | null;
  state: string | null;
}

export const DEFAULT_JOB_FILTERS: JobFilters = {
  search: '',
  workFormat: null,
  contractType: null,
  sectorId: null,
  positionId: null,
  jobType: null,
  experienceLevel: null,
  affirmative: null,
  benefitIds: [],
  salaryMin: null,
  salaryMax: null,
  city: null,
  state: null,
};