package com.example.wherewego.domain.places.controller;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.domain.places.service.KakaoPlaceService;
import com.example.wherewego.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 장소 검색 API 컨트롤러
 * 
 * 외부 API를 통한 실시간 장소 검색 및 상세 정보 조회 기능을 제공합니다.
 * API 명세에 따른 통합 검색 엔드포인트를 구현합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final KakaoPlaceService kakaoPlaceService;

    /**
     * 장소 검색 API
     * 
     * POST /api/places/search
     * 
     * 통합 장소 검색 기능을 제공합니다.
     * userLocation 파라미터는 선택사항이며, 포함될 경우 거리 기반 정렬이 가능합니다.
     * 
     * @param request 장소 검색 요청 데이터
     * @return ApiResponse<List<PlaceDetailResponse>> 장소 검색 결과
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<PlaceDetailResponse>>> searchPlaces(
            @Valid @RequestBody PlaceSearchRequest request) {
        
        log.info("장소 검색 요청 - 키워드: {}, 페이지: {}, 크기: {}", 
                request.getQuery(),
                request.getPagination() != null ? request.getPagination().getPage() : "기본값",
                request.getPagination() != null ? request.getPagination().getSize() : "기본값");
        
        // 위치 정보 로깅
        if (request.getUserLocation() != null) {
            log.info("위치 기반 검색 - 위도: {}, 경도: {}, 반경: {}m", 
                    request.getUserLocation().getLatitude(),
                    request.getUserLocation().getLongitude(),
                    request.getUserLocation().getRadius());
        }
        
        try {
            // 외부 API 호출
            List<PlaceDetailResponse> searchResults = kakaoPlaceService.searchPlaces(request);
            
            log.info("장소 검색 완료 - 총 {}개 결과", searchResults.size());
            
            return ResponseEntity.ok(
                    ApiResponse.ok("장소 검색 성공", searchResults)
            );
            
        } catch (Exception e) {
            log.error("장소 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("장소 검색 중 오류가 발생했습니다: " + e.getMessage()));
        }
    }
}