import { apiRequest } from '../axios';
import type {
  Place,
  PlaceSearchRequest,
  CreatePlaceRequest,
  PageResponse
} from '../types';
import { buildSearchQueryWithCategory, getGoogleSearchType } from '../../utils/googleCategoryConverter';

export const placeService = {
  // 장소 검색 (POST 요청) - 클라이언트 사이드 페이지네이션
  getPlaces: (params: PlaceSearchRequest = {}): Promise<PageResponse<Place>> => {
    // Google API type 파라미터용 영어 카테고리 변환
    const googleCategory = params.category ? getGoogleSearchType(params.category) : undefined;
    
    // type 파라미터가 있을 때는 query에서 카테고리 제외 (중복 방지)
    let query: string;
    if (googleCategory) {
      // type 파라미터로 카테고리를 보내므로 query에서는 제외
      query = buildSearchQueryWithCategory(
        params.keyword,
        undefined, // 카테고리 제외
        params.region
      );
    } else {
      // type 파라미터가 없을 때는 query에 카테고리 포함
      query = buildSearchQueryWithCategory(
        params.keyword,
        params.category,
        params.region
      );
    }

    // 검색어가 비어있을 때 카테고리에 맞는 기본값 설정
    let finalQuery = query.trim();
    if (!finalQuery) {
      if (params.category && params.category !== '') {
        // 선택된 카테고리가 있으면 해당 카테고리를 기본 검색어로 사용
        finalQuery = params.category;
      } else {
        // 카테고리도 선택되지 않았으면 일반적인 여행지 검색
        finalQuery = '여행지';
      }
    }

    // 백엔드 API 형식에 맞게 요청 데이터 변환
    const searchRequest: any = {
      query: finalQuery,
      category: googleCategory, // Google API type 파라미터용
      userLocation: params.latitude && params.longitude ? {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || 10000
      } : undefined
    };

    console.log('🔍 Smart Google API request:', {
      originalParams: params,
      queryStrategy: googleCategory ? 'query+type분리' : 'query통합',
      queryBeforeDefault: query,
      finalQuery: finalQuery,
      googleType: googleCategory,
      finalRequest: searchRequest
    });

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

        // 이미지 URL 디버깅
        console.log('🖼️ Places with images:', allPlaces.slice(0, 3).map(place => ({
          name: place.name,
          photo: place.photo,
          hasPhoto: !!place.photo
        })));

        console.log(`📍 Total places found: ${allPlaces.length}`);
        
        // 페이지네이션 없이 모든 결과 반환
        return {
          content: allPlaces,
          number: 0,
          size: allPlaces.length,
          totalElements: allPlaces.length,
          totalPages: 1,
          first: true,
          last: true,
          empty: allPlaces.length === 0
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