import { useState, useEffect, useCallback } from 'react';
import { placeService } from '../services/place.service';
import {
  Place,
  QueryPlaceDto,
  PlaceListApiResponse,
  PlaceResponse,
} from '../types/place.types';

export const usePlaces = (initialQuery: QueryPlaceDto = {}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialQuery.page || 1);
  const [limit, setLimit] = useState(initialQuery.limit || 10);

  const fetchPlaces = useCallback(async (query: QueryPlaceDto = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: PlaceListApiResponse = await placeService.getAll({
        ...query,
        page: query.page || 1,
        limit: query.limit || 10,
      });

      if (response.success && response.data) {
        setPlaces(response.data.records);
        setTotal(response.data.total);
        setPage(response.data.page);
        setLimit(response.data.size);
      } else {
        setError(response.error?.message || 'Failed to fetch places');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && places.length < total) {
      fetchPlaces({ page: page + 1 });
    }
  }, [loading, places.length, total, page, fetchPlaces]);

  const refresh = useCallback(() => {
    fetchPlaces({ page: 1 });
  }, [fetchPlaces]);

  const search = useCallback((searchTerm: string) => {
    console.log("searchTerm:", searchTerm);
    fetchPlaces({ text: searchTerm, page: 1 });
  }, [fetchPlaces]);

  const filterByType = useCallback((type: string) => {
    console.log("type:", type);
    fetchPlaces({ type: type as any, page: 1 });
  }, [fetchPlaces]);

  const filterByCity = useCallback((city: string) => {
    fetchPlaces({ city, page: 1 });
  }, [fetchPlaces]);

  const filterByRating = useCallback((minRating: number) => {
    fetchPlaces({ minRating, page: 1 });
  }, [fetchPlaces]);

  const filterByTags = useCallback((tags: string[]) => {
    fetchPlaces({ tags, page: 1 });
  }, [fetchPlaces]);

  useEffect(() => {
    fetchPlaces(initialQuery);
  }, [fetchPlaces]);

  return {
    places,
    loading,
    error,
    total,
    page,
    limit,
    fetchPlaces,
    loadMore,
    refresh,
    search,
    filterByType,
    filterByCity,
    filterByRating,
    filterByTags,
  };
};

export const usePlace = (id: string | null) => {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlace = useCallback(async (placeId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response: PlaceResponse = await placeService.getOne(placeId);

      if (response.success && response.data) {
        setPlace(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch place');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPlace(id);
    }
  }, [id, fetchPlace]);

  return {
    place,
    loading,
    error,
    fetchPlace,
  };
};
