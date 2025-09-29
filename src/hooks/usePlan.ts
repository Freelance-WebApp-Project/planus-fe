import { useState, useCallback } from 'react';
import { planService } from '../services/plan.service';
import {
  TravelPlan,
  GeneratePlanRequest,
  GeneratePlanResponse,
  PlanFilters,
} from '../types/plan.types';

export const usePlanGeneration = () => {
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlan = useCallback(async (request: GeneratePlanRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response: GeneratePlanResponse = await planService.generatePlan(request);

      if (response.success && response.data) {
        setPlans(response.data.plans);
      } else {
        setError(response.error?.message || 'Failed to generate travel plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);


  const clearPlans = useCallback(() => {
    setPlans([]);
    setError(null);
  }, []);


  return {
    plans,
    loading,
    error,
    generatePlan,
    clearPlans,
  };
};

export const usePlanFilters = () => {
  const [filters, setFilters] = useState<PlanFilters>({
    purpose: 'Thư giãn',
    duration: 'Cả ngày (8-10 giờ)',
    radius: 10,
    destination: '',
  });

  const updateFilter = useCallback((key: keyof PlanFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      purpose: 'Thư giãn',
      duration: 'Cả ngày (8-10 giờ)',
      radius: 10,
      destination: '',
    });
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
  };
};
