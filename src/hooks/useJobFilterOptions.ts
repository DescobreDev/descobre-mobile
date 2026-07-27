import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { Benefit, Position, Sector } from '../types/jobs';

interface UseJobFilterOptionsReturn {
  sectors: Sector[];
  benefits: Benefit[];
  positions: Position[];
  isLoadingSectors: boolean;
  isLoadingBenefits: boolean;
  isLoadingPositions: boolean;
  loadPositions: (sectorId: number | null) => void;
}

/**
 * Carrega as opções estáticas do filtro avançado (setores e benefícios) uma única vez,
 * e os cargos sob demanda conforme o setor selecionado (select em cascata).
 */
export function useJobFilterOptions(): UseJobFilterOptionsReturn {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [isLoadingSectors, setIsLoadingSectors] = useState(true);
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(true);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  useEffect(() => {
    let mounted = true;

    setIsLoadingSectors(true);
    api
      .get(ENDPOINTS.jobs.sectors)
      .then(({ data }) => {
        if (mounted) setSectors(data);
      })
      .catch(() => {
        if (mounted) setSectors([]);
      })
      .finally(() => {
        if (mounted) setIsLoadingSectors(false);
      });

    setIsLoadingBenefits(true);
    api
      .get(ENDPOINTS.jobs.benefits)
      .then(({ data }) => {
        if (mounted) setBenefits(data);
      })
      .catch(() => {
        if (mounted) setBenefits([]);
      })
      .finally(() => {
        if (mounted) setIsLoadingBenefits(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const loadPositions = useCallback((sectorId: number | null) => {
    if (!sectorId) {
      setPositions([]);
      return;
    }

    setIsLoadingPositions(true);
    api
      .get(ENDPOINTS.jobs.positionsBySector(sectorId))
      .then(({ data }) => {
        setPositions(data.positions ?? []);
      })
      .catch(() => {
        setPositions([]);
      })
      .finally(() => {
        setIsLoadingPositions(false);
      });
  }, []);

  return {
    sectors,
    benefits,
    positions,
    isLoadingSectors,
    isLoadingBenefits,
    isLoadingPositions,
    loadPositions,
  };
}