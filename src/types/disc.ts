export type DiscProfile = 'EXECUTOR' | 'COMMUNICATOR' | 'ANALYST' | 'PLANNER';

export interface DiscOption {
  label: string;
  profile: DiscProfile;
}

export interface DiscQuestion {
  id: number;
  text: string;
  options: DiscOption[];
}

export const PROFILE_META: Record<DiscProfile, {
  label: string;
  icon: string;
  color: string;
  colorLight: string;
  description: string;
  trait: string;
}> = {
  EXECUTOR: {
    label: 'Executor',
    icon: 'flash',
    color: '#ef4444',
    colorLight: '#fef2f2',
    description: 'Você age com rapidez, foca em resultados e assume desafios de frente.',
    trait: 'Decisivo & Direto',
  },
  COMMUNICATOR: {
    label: 'Comunicador',
    icon: 'chatbubbles',
    color: '#f97316',
    colorLight: '#fff7ed',
    description: 'Você inspira as pessoas ao redor, é colaborativo e cheio de entusiasmo.',
    trait: 'Entusiasta & Social',
  },
  ANALYST: {
    label: 'Analista',
    icon: 'analytics',
    color: '#6366f1',
    colorLight: '#eef2ff',
    description: 'Você é preciso, detalhista e orientado a dados e qualidade.',
    trait: 'Preciso & Criterioso',
  },
  PLANNER: {
    label: 'Planejador',
    icon: 'shield-checkmark',
    color: '#10b981',
    colorLight: '#ecfdf5',
    description: 'Você é estável, paciente e focado em harmonia e consistência.',
    trait: 'Estável & Empático',
  },
};