import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { DEFAULT_JOB_FILTERS, JobListItem, JobFilters } from '../types/jobs';

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

interface UseJobsReturn {
  jobs: JobListItem[];
  featured: JobListItem[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: Partial<JobFilters>) => void;
  activeFilterCount: number;
  resetFilters: () => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobFilters>(DEFAULT_JOB_FILTERS);
  const [page, setPage] = useState(1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentFilters = useRef(filters);
  currentFilters.current = filters;

  const fetchJobs = useCallback(async (pageNum: number, currentFilts: JobFilters, append = false) => {
    try {
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);

      setError(null);

      const params: Record<string, string | number> = {
        page: pageNum,
        limit: PAGE_SIZE,
      };

      if (currentFilts.search) params.search = currentFilts.search;
      if (currentFilts.workFormat) params.workFormat = currentFilts.workFormat;
      if (currentFilts.contractType) params.contractType = currentFilts.contractType;
      if (currentFilts.sectorId) params.sectorId = currentFilts.sectorId;
      if (currentFilts.positionId) params.positionId = currentFilts.positionId;
      if (currentFilts.jobType) params.jobType = currentFilts.jobType;
      if (currentFilts.experienceLevel) params.experienceLevel = currentFilts.experienceLevel;
      if (currentFilts.affirmative) params.affirmative = currentFilts.affirmative;
      if (currentFilts.benefitIds.length > 0) params.benefitIds = currentFilts.benefitIds.join(',');
      if (currentFilts.salaryMin != null) params.salaryMin = currentFilts.salaryMin;
      if (currentFilts.salaryMax != null) params.salaryMax = currentFilts.salaryMax;
      if (currentFilts.city) params.city = currentFilts.city;
      if (currentFilts.state) params.state = currentFilts.state;

      const { data } = await api.get(ENDPOINTS.jobs.list, { params });

      const newJobs: JobListItem[] = data.jobs ?? data;
      const total: number = data.total ?? newJobs.length;

      setJobs((prev) => append ? [...prev, ...newJobs] : newJobs);
      setHasMore(pageNum * PAGE_SIZE < total);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Não foi possível carregar as vagas.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Agrupamos todos os filtros "de aplicação imediata" (tudo, exceto a busca textual,
  // que tem debounce próprio) numa única chave. Isso evita um array de dependências
  // gigante e propenso a esquecer algum campo novo no futuro.
  const immediateFiltersKey = useMemo(
    () =>
      JSON.stringify({
        workFormat: filters.workFormat,
        contractType: filters.contractType,
        sectorId: filters.sectorId,
        positionId: filters.positionId,
        jobType: filters.jobType,
        experienceLevel: filters.experienceLevel,
        affirmative: filters.affirmative,
        benefitIds: filters.benefitIds,
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
        city: filters.city,
        state: filters.state,
      }),
    [filters],
  );

  useEffect(() => {
    setPage(1);
    fetchJobs(1, currentFilters.current, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediateFiltersKey]);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setPage(1);
      fetchJobs(1, currentFilters.current, false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [filters.search]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchJobs(nextPage, currentFilters.current, true);
  }, [page, isLoadingMore, hasMore, fetchJobs]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchJobs(1, currentFilters.current, false);
  }, [fetchJobs]);

  const setFilters = useCallback((partial: Partial<JobFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_JOB_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.workFormat) count++;
    if (filters.contractType) count++;
    if (filters.sectorId) count++;
    if (filters.positionId) count++;
    if (filters.jobType) count++;
    if (filters.experienceLevel) count++;
    if (filters.affirmative) count++;
    if (filters.benefitIds.length > 0) count++;
    if (filters.salaryMin != null || filters.salaryMax != null) count++;
    if (filters.city || filters.state) count++;
    return count;
  }, [filters]);

  const featured = jobs.slice(0, 3);

  return {
    jobs,
    featured,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    filters,
    setFilters,
    activeFilterCount,
    resetFilters,
    loadMore,
    refresh,
  };
}