import { apiRequest } from '../axios';
import type {
  Place,
  PlaceSearchRequest,
  CreatePlaceRequest,
  PageResponse
} from '../types';

export const placeService = {
  // 장소 검색 (POST 요청)
  getPlaces: (params: PlaceSearchRequest = {}): Promise<Place[]> => {
    // 검색 쿼리 조합
    let query = params.keyword || '맛집'; // 기본 검색어
    
    // 카테고리가 선택되었으면 쿼리에 추가
    if (params.category) {
      query += ` ${params.category}`;
    }
    
    // 지역이 선택되었으면 쿼리에 추가
    if (params.region) {
      query += ` ${params.region}`;
    }

    // 백엔드 API 형식에 맞게 요청 데이터 변환
    const searchRequest: any = {
      query: query.trim(), // 공백 제거
    };

    // pagination 설정 (선택사항)
    if (params.page !== undefined || params.size !== undefined) {
      searchRequest.pagination = {
        page: (params.page || 0) + 1, // 백엔드는 1부터 시작
        size: params.size || 20
      };
    }

    // sort 설정 (선택사항)
    searchRequest.sort = 'distance';

    console.log('Place search request:', searchRequest); // 디버깅용

    return apiRequest.post<Place[]>('/places/search', searchRequest)
      .then(response => response.data);
  },

  // 장소 상세 조회  
  getPlaceById: (id: string): Promise<Place> =>
    apiRequest.get<Place>(`/places/${id}/details`)
      .then(response => response.data),

  // 장소 생성 (관리자만)
  createPlace: (placeData: CreatePlaceRequest): Promise<Place> =>
    apiRequest.post<Place>('/places', placeData)
      .then(response => response.data),

  // 장소 수정 (관리자만)
  updatePlace: (id: string, placeData: Partial<CreatePlaceRequest>): Promise<Place> =>
    apiRequest.put<Place>(`/places/${id}`, placeData)
      .then(response => response.data),

  // 장소 삭제 (관리자만)
  deletePlace: (id: string): Promise<void> =>
    apiRequest.delete<void>(`/places/${id}`)
      .then(response => response.data),

  // 인기 장소 조회
  getPopularPlaces: (limit: number = 10): Promise<Place[]> =>
    apiRequest.get<Place[]>(`/places/popular?limit=${limit}`)
      .then(response => response.data),

  // 추천 장소 조회 (위치 기반)
  getRecommendedPlaces: (
    latitude: number, 
    longitude: number, 
    radius: number = 10000,
    limit: number = 10
  ): Promise<Place[]> =>
    apiRequest.get<Place[]>('/places/recommendations', {
      params: { latitude, longitude, radius, limit }
    }).then(response => response.data),

  // 장소 카테고리 목록 조회
  getCategories: (): Promise<string[]> =>
    apiRequest.get<string[]>('/places/categories')
      .then(response => response.data),

  // 지역 목록 조회
  getRegions: (): Promise<string[]> =>
    apiRequest.get<string[]>('/places/regions')
      .then(response => response.data),

  // 장소 검색 자동완성
  getPlacesSuggestions: (keyword: string, limit: number = 5): Promise<Place[]> =>
    apiRequest.get<Place[]>('/places/suggestions', {
      params: { keyword, limit }
    }).then(response => response.data),

  // 근처 장소 검색
  getNearbyPlaces: (
    latitude: number,
    longitude: number,
    radius: number = 5000,
    category?: string
  ): Promise<Place[]> =>
    apiRequest.get<Place[]>('/places/nearby', {
      params: { latitude, longitude, radius, category }
    }).then(response => response.data),
};