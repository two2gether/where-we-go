package com.example.wherewego.domain.places.service;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;

import java.util.List;

/**
 * 장소 검색 서비스 인터페이스
 * 
 * 다양한 외부 API (카카오, 네이버 등)를 통한 장소 검색 기능을 제공합니다.
 * 각 API별로 구현체를 만들어 확장 가능한 구조를 제공합니다.
 * 
 * 구현체:
 * - KakaoPlaceService: 카카오 로컬 API 연동
 * - NaverPlaceService: 네이버 지역 검색 API 연동 (향후 구현)
 */
public interface PlaceSearchService {

    /**
     * 키워드 기반 장소 검색
     * 
     * @param request 검색 요청 정보 (키워드, 위치, 페이징 등)
     * @return 검색된 장소 목록
     */
    List<PlaceDetailResponse> searchPlaces(PlaceSearchRequest request);

    /**
     * 특정 장소의 상세 정보 조회
     * 
     * @param apiPlaceId 외부 API의 장소 ID
     * @return 장소 상세 정보
     */
    PlaceDetailResponse getPlaceDetail(String apiPlaceId);

    /**
     * 서비스 제공자 정보 반환
     * 
     * @return API 제공자명 ("kakao", "naver" 등)
     */
    String getProviderName();

    /**
     * 서비스 가용성 확인
     * 
     * @return 서비스 사용 가능 여부
     */
    Boolean isServiceAvailable();
}