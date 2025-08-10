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
    staleTime: 2 * 60 * 1000, // 2분으로 단축 (북마크 변경 감지 향상)
    refetchOnWindowFocus: false,
    // 북마크 변경을 위해 mount 시에도 refetch 허용
    refetchOnMount: 'always',
    refetchOnReconnect: false,
  });
};

// 무한 스크롤을 위한 장소 목록 조회 (20개 기준 클라이언트 사이드 페이지네이션)
export const useInfinitePlaces = (params: Omit<PlaceSearchRequest, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: [...placeKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 0 }) => {
      console.log(`🔄 Fetching places page ${pageParam} with params:`, { ...params, page: pageParam });
      return placeService.getPlaces({ ...params, page: pageParam, size: 10 }); // 20개를 2페이지로 나누기 위해 10개씩
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      console.log('📄 Determining next page from (20개 기준):', lastPage);
      console.log(`  - Current page: ${lastPage?.number}`);
      console.log(`  - Is last: ${lastPage?.last}`);
      console.log(`  - Content length: ${lastPage?.content?.length || 0}`);
      console.log(`  - Total pages: ${lastPage?.totalPages}`);
      console.log(`  - Total elements: ${lastPage?.totalElements}`);
      
      // Google API 20개 기준으로 종료 조건 체크
      if (lastPage?.last || lastPage?.content?.length === 0) {
        console.log('❌ No more pages (reached end of Google API results)');
        return undefined;
      }
      
      const nextPage = (lastPage?.number || 0) + 1;
      
      // 총 페이지 수를 초과하지 않도록 체크 (20개 기준)
      if (nextPage >= (lastPage?.totalPages || 0)) {
        console.log('❌ No more pages (exceeded total pages for 20 results)');
        return undefined;
      }
      
      console.log(`✅ Next page: ${nextPage} (expecting up to 2 pages for 20 results)`);
      return nextPage;
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