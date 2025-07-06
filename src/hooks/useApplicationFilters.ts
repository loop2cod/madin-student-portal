import { useState, useCallback, useMemo } from 'react';

export interface ApplicationFilters {
  search: string;
  status: string;
  statuses: string[];
  department: string;
  departments: string[];
  dateFrom: string;
  dateTo: string;
  currentStage: string;
  hasEducationDetails: string;
  programLevel: string;
  reviewedBy: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const initialFilters: ApplicationFilters = {
  search: '',
  status: 'all',
  statuses: [],
  department: 'all',
  departments: [],
  dateFrom: '',
  dateTo: '',
  currentStage: 'all',
  hasEducationDetails: 'all',
  programLevel: 'all',
  reviewedBy: 'all',
  sortBy: 'createdAt',
  sortOrder: 'desc'
};

export function useApplicationFilters() {
  const [filters, setFilters] = useState<ApplicationFilters>(initialFilters);

  const updateFilter = useCallback(<K extends keyof ApplicationFilters>(
    key: K,
    value: ApplicationFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateMultipleFilters = useCallback((updates: Partial<ApplicationFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const clearSearchAndFilters = useCallback(() => {
    setFilters({
      ...initialFilters,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder
    });
  }, [filters.sortBy, filters.sortOrder]);

  // Generate query parameters for API calls
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '' && 
          !(Array.isArray(value) && value.length === 0)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });

    return params;
  }, [filters]);

  // Check if any filters are active (excluding sort)
  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false;
      if (Array.isArray(value)) return value.length > 0;
      return value && value !== 'all' && value !== '';
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    resetFilters,
    clearSearchAndFilters,
    queryParams,
    hasActiveFilters
  };
}