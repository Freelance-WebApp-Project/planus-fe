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

  const generateQuickPlan = useCallback(async (
    userId: string,
    lat: number,
    lng: number,
    city: string,
    purpose: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: GeneratePlanResponse = await planService.generateQuickPlan(
        userId,
        lat,
        lng,
        city,
        purpose
      );

      if (response.success && response.data) {
        setPlans(response.data.plans);
      } else {
        setError(response.error?.message || 'Failed to generate quick travel plans');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateCustomPlan = useCallback(async (
    userId: string,
    lat: number,
    lng: number,
    city: string,
    purpose: string,
    duration: string,
    radius: number,
    destination?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response: GeneratePlanResponse = await planService.generateCustomPlan(
        userId,
        lat,
        lng,
        city,
        purpose,
        duration,
        radius,
        destination
      );

      if (response.success && response.data) {
        setPlans(response.data.plans);
      } else {
        setError(response.error?.message || 'Failed to generate custom travel plans');
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

  const filterPlansByCost = useCallback((maxCost: number) => {
    const filteredPlans = planService.filterPlansByCost(plans, maxCost);
    setPlans(filteredPlans);
  }, [plans]);

  const sortPlansByCost = useCallback(() => {
    const sortedPlans = planService.sortPlansByCost(plans);
    setPlans(sortedPlans);
  }, [plans]);

  const sortPlansByRating = useCallback(() => {
    const sortedPlans = planService.sortPlansByRating(plans);
    setPlans(sortedPlans);
  }, [plans]);

  const getPlanSummary = useCallback((plan: TravelPlan) => {
    return planService.getPlanSummary(plan);
  }, []);

  return {
    plans,
    loading,
    error,
    generatePlan,
    generateQuickPlan,
    generateCustomPlan,
    clearPlans,
    filterPlansByCost,
    sortPlansByCost,
    sortPlansByRating,
    getPlanSummary,
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
