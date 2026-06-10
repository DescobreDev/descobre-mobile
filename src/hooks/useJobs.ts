import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';
import { JobListItem, JobFilters } from '../types/jobs';

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
  loadMore: () => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: JobFilters = {
  search: '',
  workFormat: null,
  contractType: null,
  sectorId: null,
};

export function useJobs(): UseJobsReturn {
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobFilters>(DEFAULT_FILTERS);
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

      if (currentFilts.search)      params.search       = currentFilts.search;
      if (currentFilts.workFormat)  params.workFormat   = currentFilts.workFormat;
      if (currentFilts.contractType) params.contractType = currentFilts.contractType;
      if (currentFilts.sectorId)    params.sectorId     = currentFilts.sectorId;

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

  useEffect(() => {
    setPage(1);
    fetchJobs(1, filters, false);
  }, [filters.workFormat, filters.contractType, filters.sectorId]);

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
    loadMore,
    refresh,
  };
}