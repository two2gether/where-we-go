import { apiRequest } from '../axios';
import type {
  Place,
  PlaceSearchRequest,
  CreatePlaceRequest,
  PageResponse
} from '../types';

export const placeService = {
  // 장소 검색 (POST 요청) - 클라이언트 사이드 페이지네이션
  getPlaces: (params: PlaceSearchRequest = {}): Promise<PageResponse<Place>> => {
    // 검색 쿼리 조합 - query 또는 keyword 사용
    let query = params.query || params.keyword || '맛집'; // 기본 검색어
    
    // 카테고리가 선택되었으면 쿼리에 추가
    if (params.category) {
      query += ` ${params.category}`;
    }
    
    // 지역이 선택되었으면 쿼리에 추가
    if (params.region) {
      query += ` ${params.region}`;
    }

    // 백엔드 API 형식에 맞게 요청 데이터 변환 (페이지네이션 제거)
    const searchRequest: any = {
      query: query.trim(), // 공백 제거
      sort: 'distance'
    };

    console.log('Place search request (no pagination):', searchRequest);

    return apiRequest.post<any>('/places/search', searchRequest)
      .then(response => {
        console.log('Raw API response:', response.data);
        
        // 백엔드에서 받은 전체 결과 (최대 60개 예상)
        let allPlaces: Place[] = [];
        
        if (Array.isArray(response.data)) {
          allPlaces = response.data as Place[];
        } else if (response.data?.data) {
          allPlaces = response.data.data as Place[];
        } else {
          allPlaces = [];
        }

        // 클라이언트 사이드 페이지네이션 적용 (20개 기준)
        const page = params.page || 0;
        const size = params.size || 10; // 20개를 2페이지로 나누기 위해 10개씩
        const startIndex = page * size;
        const endIndex = startIndex + size;
        
        // 요청된 페이지에 해당하는 데이터 추출
        const pageContent = allPlaces.slice(startIndex, endIndex);
        
        // Google API 최대 결과 60개 기준으로 페이지네이션 처리
        const totalElements = allPlaces.length;
        const totalPages = Math.ceil(totalElements / size);
        const isLast = endIndex >= totalElements;
        
        console.log(`Client-side pagination (20개 기준): page=${page}, size=${size}, start=${startIndex}, end=${endIndex}, total=${totalElements}`);
        console.log(`Page content: ${pageContent.length} items, isLast=${isLast}`);
        console.log(`Google API results: ${totalElements} (max 20)`);
        
        return {
          content: pageContent,
          number: page,
          size: size,
          totalElements: totalElements,
          totalPages: totalPages,
          first: page === 0,
          last: isLast,
          empty: pageContent.length === 0
        } as PageResponse<Place>;
      });
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