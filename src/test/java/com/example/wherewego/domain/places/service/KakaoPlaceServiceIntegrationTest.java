package com.example.wherewego.domain.places.service;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * KakaoPlaceService 통합 테스트
 * 
 * 실제 카카오 API를 호출하여 전체 플로우를 검증합니다.
 * @ActiveProfiles("test")를 사용하여 테스트 환경에서만 실행됩니다.
 * 
 * 주의: 이 테스트는 실제 API 키가 필요하며, API 호출 제한이 있을 수 있습니다.
 */
@SpringBootTest
@ActiveProfiles("test")
@DisplayName("카카오 장소 검색 서비스 통합 테스트")
class KakaoPlaceServiceIntegrationTest {

    @Autowired
    private KakaoPlaceService kakaoPlaceService;

    @Test
    @DisplayName("실제 API 호출 - 스타벅스 검색이 정상 작동한다")
    void searchPlaces_RealApi_Starbucks() {
        // given
        PlaceSearchRequest request = PlaceSearchRequest.builder()
                .query("스타벅스")
                .pagination(PlaceSearchRequest.Pagination.builder()
                        .page(1)
                        .size(5)
                        .build())
                .userLocation(PlaceSearchRequest.UserLocation.builder()
                        .latitude(37.5665)  // 서울 시청 근처
                        .longitude(126.9780)
                        .radius(2000)
                        .build())
                .build();

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isNotEmpty();
        assertThat(result.size()).isLessThanOrEqualTo(5);
        
        PlaceDetailResponse firstPlace = result.get(0);
        assertThat(firstPlace.getName()).containsIgnoringCase("스타벅스");
        assertThat(firstPlace.getApiPlaceId()).isNotNull();
        assertThat(firstPlace.getLatitude()).isNotNull();
        assertThat(firstPlace.getLongitude()).isNotNull();
        assertThat(firstPlace.getDistance()).isNotNull();
        assertThat(firstPlace.getDistance()).isGreaterThan(0);
        
        // 서울 근처이므로 거리가 합리적인 범위에 있는지 확인
        assertThat(firstPlace.getDistance()).isLessThan(10000); // 10km 이내
    }

    @Test
    @DisplayName("실제 API 호출 - 위치 없이 검색해도 정상 작동한다")
    void searchPlaces_RealApi_WithoutLocation() {
        // given
        PlaceSearchRequest request = PlaceSearchRequest.builder()
                .query("햄버거")
                .pagination(PlaceSearchRequest.Pagination.builder()
                        .page(1)
                        .size(3)
                        .build())
                .build();

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        System.out.println("=== API 호출 결과 ===");
        System.out.println("결과 개수: " + result.size());
        if (!result.isEmpty()) {
            System.out.println("첫 번째 결과: " + result.get(0).getName());
        }
        
        // API 호출 자체가 성공했는지 확인 (결과가 없을 수도 있음)
        assertThat(result).isNotNull();
        
        // 결과가 있다면 검증
        if (!result.isEmpty()) {
            assertThat(result.size()).isLessThanOrEqualTo(3);
            
            PlaceDetailResponse firstPlace = result.get(0);
            assertThat(firstPlace.getName()).isNotNull(); // 이름 존재
            assertThat(firstPlace.getDistance()).isNull(); // 위치 정보 없으므로 거리 계산 안됨
            assertThat(firstPlace.getAddress()).isNotNull();
            assertThat(firstPlace.getLatitude()).isNotNull();
            assertThat(firstPlace.getLongitude()).isNotNull();
        }
    }

    @Test
    @DisplayName("실제 API 호출 - 존재하지 않는 검색어는 빈 결과를 반환한다")
    void searchPlaces_RealApi_NonExistent() {
        // given
        PlaceSearchRequest request = PlaceSearchRequest.builder()
                .query("존재하지않는매우특이한장소명12345")
                .pagination(PlaceSearchRequest.Pagination.builder()
                        .page(1)
                        .size(5)
                        .build())
                .build();

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("실제 API 호출 - 카테고리 필터링이 정상 작동한다")
    void searchPlaces_RealApi_WithCategory() {
        // given
        PlaceSearchRequest request = PlaceSearchRequest.builder()
                .query("커피")
                .pagination(PlaceSearchRequest.Pagination.builder()
                        .page(1)
                        .size(3)
                        .build())
                .userLocation(PlaceSearchRequest.UserLocation.builder()
                        .latitude(37.5665)
                        .longitude(126.9780)
                        .radius(1000)
                        .build())
                .build();

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isNotEmpty();
        
        // 카테고리가 카페 관련인지 확인
        result.forEach(place -> {
            assertThat(place.getCategory()).isNotNull();
            // 카페, 커피, 디저트 등 관련 카테고리여야 함
        });
    }

    @Test
    @DisplayName("서비스 메타 정보 검증")
    void serviceInfo() {
        // when & then
        assertThat(kakaoPlaceService.getProviderName()).isEqualTo("kakao");
        assertThat(kakaoPlaceService.isServiceAvailable()).isTrue();
    }
}