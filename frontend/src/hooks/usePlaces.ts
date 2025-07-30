import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { placeService } from '../api';
import type { Place, PlaceSearchRequest, CreatePlaceRequest } from '../api/types';

// Query Keys
export const placeKeys = {
  all: ['places'] as const,
  lists: () => [...placeKeys.all, 'list'] as const,
  list: (params: PlaceSearchRequest) => [...placeKeys.lists(), params] as const,
  details: () => [...placeKeys.all, 'detail'] as const,
  detail: (id: string) => [...placeKeys.details(), id] as const,
  popular: () => [...placeKeys.all, 'popular'] as const,
  recommendations: (lat: number, lng: number) => [...placeKeys.all, 'recommendations', lat, lng] as const,
  categories: () => [...placeKeys.all, 'categories'] as const,
  regions: () => [...placeKeys.all, 'regions'] as const,
  suggestions: (keyword: string) => [...placeKeys.all, 'suggestions', keyword] as const,
  nearby: (lat: number, lng: number, radius?: number, category?: string) => 
    [...placeKeys.all, 'nearby', lat, lng, radius, category] as const,
};

// 장소 목록 조회 (검색)
export const usePlaces = (params: PlaceSearchRequest = {}) => {
  return useQuery({
    queryKey: placeKeys.list(params),
    queryFn: () => placeService.getPlaces(params),
    staleTime: 5 * 60 * 1000, // 5분
    refetchOnWindowFocus: false,
    // 중복 요청 방지를 위해 한번만 fetch하고 캐시 활용
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};

// 무한 스크롤을 위한 장소 목록 조회
export const useInfinitePlaces = (params: Omit<PlaceSearchRequest, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: [...placeKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 0 }) => 
      placeService.getPlaces({ ...params, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// 장소 상세 조회
export const usePlace = (id: string) => {
  return useQuery({
    queryKey: placeKeys.detail(id),
    queryFn: () => placeService.getPlaceById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 인기 장소 조회
export const usePopularPlaces = (limit: number = 10) => {
  return useQuery({
    queryKey: [...placeKeys.popular(), limit],
    queryFn: () => placeService.getPopularPlaces(limit),
    staleTime: 30 * 60 * 1000, // 30분
  });
};

// 추천 장소 조회
export const useRecommendedPlaces = (
  latitude: number,
  longitude: number,
  radius: number = 10000,
  limit: number = 10
) => {
  return useQuery({
    queryKey: placeKeys.recommendations(latitude, longitude),
    queryFn: () => placeService.getRecommendedPlaces(latitude, longitude, radius, limit),
    enabled: !!(latitude && longitude),
    staleTime: 15 * 60 * 1000, // 15분
  });
};

// 장소 카테고리 목록
export const usePlaceCategories = () => {
  return useQuery({
    queryKey: placeKeys.categories(),
    queryFn: placeService.getCategories,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

// 지역 목록
export const usePlaceRegions = () => {
  return useQuery({
    queryKey: placeKeys.regions(),
    queryFn: placeService.getRegions,
    staleTime: 60 * 60 * 1000, // 1시간
  });
};

// 장소 검색 자동완성
export const usePlaceSuggestions = (keyword: string, limit: number = 5) => {
  return useQuery({
    queryKey: placeKeys.suggestions(keyword),
    queryFn: () => placeService.getPlacesSuggestions(keyword, limit),
    enabled: keyword.length >= 2,
    staleTime: 2 * 60 * 1000, // 2분
    refetchOnWindowFocus: false,
  });
};

// 근처 장소 검색
export const useNearbyPlaces = (
  latitude: number,
  longitude: number,
  radius: number = 5000,
  category?: string
) => {
  return useQuery({
    queryKey: placeKeys.nearby(latitude, longitude, radius, category),
    queryFn: () => placeService.getNearbyPlaces(latitude, longitude, radius, category),
    enabled: !!(latitude && longitude),
    staleTime: 10 * 60 * 1000, // 10분
  });
};

// 장소 생성 (관리자용)
export const useCreatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeData: CreatePlaceRequest) => placeService.createPlace(placeData),
    onSuccess: (newPlace) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.popular() });
      
      // 새 장소 캐시에 추가
      queryClient.setQueryData(placeKeys.detail(newPlace.placeId), newPlace);
    },
    onError: (error) => {
      console.error('Place creation failed:', error);
    },
  });
};

// 장소 수정 (관리자용)
export const useUpdatePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlaceRequest> }) =>
      placeService.updatePlace(id, data),
    onSuccess: (updatedPlace) => {
      // 캐시 업데이트
      queryClient.setQueryData(placeKeys.detail(updatedPlace.placeId), updatedPlace);
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.popular() });
    },
    onError: (error) => {
      console.error('Place update failed:', error);
    },
  });
};

// 장소 삭제 (관리자용)
export const useDeletePlace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => placeService.deletePlace(id),
    onSuccess: (_, deletedId) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: placeKeys.detail(deletedId) });
      
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: placeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: placeKeys.popular() });
    },
    onError: (error) => {
      console.error('Place deletion failed:', error);
    },
  });
};