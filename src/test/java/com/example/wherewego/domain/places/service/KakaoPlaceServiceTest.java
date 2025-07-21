package com.example.wherewego.domain.places.service;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.KakaoPlaceResponse;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * KakaoPlaceService 테스트 클래스
 * 
 * 이 테스트는 카카오 API 데이터 수신과 변환 로직을 검증합니다.
 * - Mock을 사용하여 실제 API 호출 없이 테스트
 * - 데이터 변환 로직의 정확성 검증
 * - 에러 처리 상황 검증
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("카카오 장소 검색 서비스 테스트")
class KakaoPlaceServiceTest {

    @Mock
    private WebClient mockWebClient;
    
    @Mock
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    
    @Mock
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    
    @Mock
    private WebClient.ResponseSpec responseSpec;

    private KakaoPlaceService kakaoPlaceService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        kakaoPlaceService = new KakaoPlaceService(mockWebClient);
        objectMapper = new ObjectMapper();
    }

    @Test
    @DisplayName("정상적인 장소 검색 - 카카오 API 응답을 올바르게 변환한다")
    void searchPlaces_Success_ConvertCorrectly() throws Exception {
        // given
        PlaceSearchRequest request = createSearchRequest("스타벅스", 37.5665, 126.9780);
        KakaoPlaceResponse mockResponse = createMockKakaoResponse();
        
        setupMockWebClient(mockResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(2);
        
        PlaceDetailResponse firstPlace = result.get(0);
        assertThat(firstPlace.getName()).isEqualTo("테스트카페");
        assertThat(firstPlace.getPlaceId()).isEqualTo("TEST001");
        assertThat(firstPlace.getCategory()).isEqualTo("카페");
        assertThat(firstPlace.getAddress()).isEqualTo("서울 테스트구 테스트로 123");
        assertThat(firstPlace.getRoadAddress()).isEqualTo("서울 테스트구 테스트로 123");
        assertThat(firstPlace.getPhone()).isEqualTo("02-000-0000");
        assertThat(firstPlace.getLatitude()).isEqualTo(37.500000);
        assertThat(firstPlace.getLongitude()).isEqualTo(127.000000);
        assertThat(firstPlace.getPlaceUrl()).isEqualTo("http://place.map.kakao.com/TEST001");
        assertThat(firstPlace.getDistance()).isNotNull();
        assertThat(firstPlace.getBookmarkCount()).isEqualTo(0);
        assertThat(firstPlace.getIsBookmarked()).isFalse();
        
        // 새로 추가된 필드들 검증
        assertThat(firstPlace.getAverageRating()).isEqualTo(0.0);  // 기본값
        assertThat(firstPlace.getReviewCount()).isEqualTo(0);      // 기본값
        assertThat(firstPlace.getRegionSummary()).isEqualTo("서울 테스트구");  // 자동 생성
        
        // 지역 정보 검증
        assertThat(firstPlace.getRegion().getDepth1()).isEqualTo("서울");
        assertThat(firstPlace.getRegion().getDepth2()).isEqualTo("테스트구");
        assertThat(firstPlace.getRegion().getDepth3()).isEqualTo("테스트동");
    }

    @Test
    @DisplayName("카테고리 추출 테스트 - 계층형 카테고리에서 주요 카테고리를 추출한다")
    void searchPlaces_CategoryExtraction() throws Exception {
        // given
        PlaceSearchRequest request = createSearchRequest("커피", null, null);
        KakaoPlaceResponse mockResponse = createMockKakaoResponseWithVariousCategories();
        
        setupMockWebClient(mockResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).hasSize(3);
        assertThat(result.get(0).getCategory()).isEqualTo("카페");  // categoryGroupName: "카페"
        assertThat(result.get(1).getCategory()).isEqualTo("음식점");  // categoryGroupName: "음식점"
        assertThat(result.get(2).getCategory()).isEqualTo("편의점");  // categoryGroupName: "편의점"
    }

    @Test
    @DisplayName("거리 계산 테스트 - 사용자 위치와 장소 간 거리를 정확히 계산한다")
    void searchPlaces_DistanceCalculation() throws Exception {
        // given - 서울역 근처 위치
        double userLat = 37.5547;
        double userLon = 126.9706;
        PlaceSearchRequest request = createSearchRequest("맛집", userLat, userLon);
        
        KakaoPlaceResponse mockResponse = createMockKakaoResponseForDistanceTest();
        setupMockWebClient(mockResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).hasSize(1);
        PlaceDetailResponse place = result.get(0);
        
        // 거리가 계산되었는지 확인 (대략 500m 정도)
        assertThat(place.getDistance()).isNotNull();
        assertThat(place.getDistance()).isBetween(600, 700);
    }

    @Test
    @DisplayName("사용자 위치 없이 검색 - 거리 계산 없이 정상 처리한다")
    void searchPlaces_WithoutUserLocation() throws Exception {
        // given
        PlaceSearchRequest request = createSearchRequest("맛집", null, null);
        KakaoPlaceResponse mockResponse = createMockKakaoResponse();
        
        setupMockWebClient(mockResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isNotEmpty();
        PlaceDetailResponse place = result.get(0);
        assertThat(place.getDistance()).isNull();  // 거리 계산 안됨
    }

    @Test
    @DisplayName("빈 응답 처리 - 검색 결과가 없을 때 빈 리스트를 반환한다")
    void searchPlaces_EmptyResponse() throws Exception {
        // given
        PlaceSearchRequest request = createSearchRequest("존재하지않는장소", null, null);
        KakaoPlaceResponse emptyResponse = KakaoPlaceResponse.builder()
                .documents(List.of())
                .meta(KakaoPlaceResponse.Meta.builder().totalCount(0).isEnd(true).build())
                .build();
        
        setupMockWebClient(emptyResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("API 오류 처리 - WebClient 예외 발생 시 빈 리스트를 반환한다")
    void searchPlaces_ApiError() {
        // given
        PlaceSearchRequest request = createSearchRequest("스타벅스", null, null);
        
        when(mockWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        
        // timeout이 포함된 체인 에러 시뮬레이션 (String.class로 변경)
        Mono<String> errorMono = Mono.error(new RuntimeException("API 호출 실패"));
        when(responseSpec.bodyToMono(String.class)).thenReturn(errorMono);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("null 응답 처리 - API에서 null 반환 시 빈 리스트를 반환한다")
    void searchPlaces_NullResponse() {
        // given
        PlaceSearchRequest request = createSearchRequest("스타벅스", null, null);
        
        when(mockWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        
        // null을 반환하는 경우는 실제로는 발생하지 않지만, 테스트를 위해 empty로 대체 (String.class로 변경)
        Mono<String> emptyMono = Mono.empty();
        when(responseSpec.bodyToMono(String.class)).thenReturn(emptyMono);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("regionSummary 생성 테스트 - 지역명을 올바르게 단순화한다")
    void searchPlaces_RegionSummaryGeneration() throws Exception {
        // given
        PlaceSearchRequest request = createSearchRequest("맛집", null, null);
        KakaoPlaceResponse mockResponse = createMockKakaoResponseForRegionTest();
        
        setupMockWebClient(mockResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).hasSize(3);
        
        // 서울특별시 강남구 → 서울 강남구
        assertThat(result.get(0).getRegionSummary()).isEqualTo("서울 강남구");
        
        // 부산광역시 해운대구 → 부산 해운대구  
        assertThat(result.get(1).getRegionSummary()).isEqualTo("부산 해운대구");
        
        // 제주특별자치도 제주시 → 제주 제주시
        assertThat(result.get(2).getRegionSummary()).isEqualTo("제주 제주시");
    }

    @Test
    @DisplayName("잘못된 데이터 처리 - 위도/경도 변환 실패 시에도 장소 정보는 반환한다")
    void searchPlaces_InvalidCoordinates() throws Exception {
        // given
        PlaceSearchRequest request = createSearchRequest("맛집", null, null);
        KakaoPlaceResponse mockResponse = createMockKakaoResponseWithInvalidCoordinates();
        
        setupMockWebClient(mockResponse);

        // when
        List<PlaceDetailResponse> result = kakaoPlaceService.searchPlaces(request);

        // then
        assertThat(result).hasSize(1);
        PlaceDetailResponse place = result.get(0);
        assertThat(place.getName()).isEqualTo("테스트장소");
        assertThat(place.getLatitude()).isNull();  // 변환 실패로 null
        assertThat(place.getLongitude()).isNull(); // 변환 실패로 null
    }

    @Test
    @DisplayName("서비스 메타 정보 검증")
    void serviceMetaInfo() {
        // when & then
        assertThat(kakaoPlaceService.getProviderName()).isEqualTo("kakao");
        assertThat(kakaoPlaceService.isServiceAvailable()).isTrue();
        assertThat(kakaoPlaceService.getPlaceDetail("test")).isNull(); // TODO로 남겨둠
    }

    // === Helper Methods ===

    private PlaceSearchRequest createSearchRequest(String query, Double lat, Double lon) {
        PlaceSearchRequest.PlaceSearchRequestBuilder builder = PlaceSearchRequest.builder()
                .query(query)
                .pagination(PlaceSearchRequest.Pagination.builder()
                        .page(1)
                        .size(15)
                        .build());
        
        if (lat != null && lon != null) {
            builder.userLocation(PlaceSearchRequest.UserLocation.builder()
                    .latitude(lat)
                    .longitude(lon)
                    .radius(1000)
                    .build());
        }
        
        return builder.build();
    }

    private KakaoPlaceResponse createMockKakaoResponse() {
        List<KakaoPlaceResponse.PlaceDocument> documents = List.of(
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("TEST001")
                        .placeName("테스트카페")
                        .categoryName("음식점 > 카페 > 커피전문점")
                        .categoryGroupName("카페")
                        .phone("02-000-0000")
                        .addressName("서울 테스트구 테스트로 123")
                        .roadAddressName("서울 테스트구 테스트로 123")
                        .region1DepthName("서울")
                        .region2DepthName("테스트구")
                        .region3DepthName("테스트동")
                        .longitude("127.000000")
                        .latitude("37.500000")
                        .placeUrl("http://place.map.kakao.com/TEST001")
                        .distance("500")
                        .build(),
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("TEST002")
                        .placeName("테스트베이커리")
                        .categoryName("음식점 > 디저트 > 베이커리")
                        .categoryGroupName("음식점")
                        .phone("02-000-0001")
                        .addressName("서울 테스트구 테스트로 456")
                        .roadAddressName("서울 테스트구 테스트로 456")
                        .region1DepthName("서울")
                        .region2DepthName("테스트구")
                        .region3DepthName("테스트동")
                        .longitude("127.000001")
                        .latitude("37.500001")
                        .placeUrl("http://place.map.kakao.com/TEST002")
                        .distance("800")
                        .build()
        );

        return KakaoPlaceResponse.builder()
                .documents(documents)
                .meta(KakaoPlaceResponse.Meta.builder()
                        .totalCount(2)
                        .pageableCount(2)
                        .isEnd(false)
                        .build())
                .build();
    }

    private KakaoPlaceResponse createMockKakaoResponseWithVariousCategories() {
        List<KakaoPlaceResponse.PlaceDocument> documents = List.of(
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("CAT001")
                        .placeName("테스트카페A")
                        .categoryName("음식점 > 카페 > 커피전문점")
                        .categoryGroupName("카페")
                        .addressName("서울 테스트구")
                        .longitude("127.0")
                        .latitude("37.5")
                        .build(),
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("CAT002")
                        .placeName("테스트베이커리A")
                        .categoryName("음식점 > 디저트 > 베이커리")
                        .categoryGroupName("음식점")
                        .addressName("서울 테스트구")
                        .longitude("127.0")
                        .latitude("37.5")
                        .build(),
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("CAT003")
                        .placeName("테스트편의점A")
                        .categoryName("편의점")
                        .categoryGroupName("편의점")
                        .addressName("서울 테스트구")
                        .longitude("127.0")
                        .latitude("37.5")
                        .build()
        );

        return KakaoPlaceResponse.builder()
                .documents(documents)
                .meta(KakaoPlaceResponse.Meta.builder().totalCount(3).build())
                .build();
    }

    private KakaoPlaceResponse createMockKakaoResponseForDistanceTest() {
        List<KakaoPlaceResponse.PlaceDocument> documents = List.of(
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("DIST001")
                        .placeName("테스트맛집")
                        .categoryName("음식점 > 한식")
                        .categoryGroupName("음식점")
                        .addressName("서울 테스트구 테스트로")
                        .longitude("126.9748")
                        .latitude("37.5596")
                        .build()
        );

        return KakaoPlaceResponse.builder()
                .documents(documents)
                .meta(KakaoPlaceResponse.Meta.builder().totalCount(1).build())
                .build();
    }

    private KakaoPlaceResponse createMockKakaoResponseForRegionTest() {
        List<KakaoPlaceResponse.PlaceDocument> documents = List.of(
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("REGION001")
                        .placeName("서울맛집")
                        .categoryGroupName("음식점")
                        .addressName("서울특별시 강남구 테스트로")
                        .region1DepthName("서울특별시")
                        .region2DepthName("강남구")
                        .region3DepthName("역삼동")
                        .longitude("127.0")
                        .latitude("37.5")
                        .build(),
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("REGION002")
                        .placeName("부산맛집")
                        .categoryGroupName("음식점")
                        .addressName("부산광역시 해운대구 테스트로")
                        .region1DepthName("부산광역시")
                        .region2DepthName("해운대구")
                        .region3DepthName("우동")
                        .longitude("129.0")
                        .latitude("35.1")
                        .build(),
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("REGION003")
                        .placeName("제주맛집")
                        .categoryGroupName("음식점")
                        .addressName("제주특별자치도 제주시 테스트로")
                        .region1DepthName("제주특별자치도")
                        .region2DepthName("제주시")
                        .region3DepthName("이도동")
                        .longitude("126.5")
                        .latitude("33.5")
                        .build()
        );

        return KakaoPlaceResponse.builder()
                .documents(documents)
                .meta(KakaoPlaceResponse.Meta.builder().totalCount(3).build())
                .build();
    }

    private KakaoPlaceResponse createMockKakaoResponseWithInvalidCoordinates() {
        List<KakaoPlaceResponse.PlaceDocument> documents = List.of(
                KakaoPlaceResponse.PlaceDocument.builder()
                        .id("INVALID001")
                        .placeName("테스트장소")
                        .categoryName("음식점")
                        .categoryGroupName("음식점")
                        .addressName("서울 테스트구")
                        .longitude("invalid_longitude")  // 잘못된 데이터
                        .latitude("invalid_latitude")    // 잘못된 데이터
                        .build()
        );

        return KakaoPlaceResponse.builder()
                .documents(documents)
                .meta(KakaoPlaceResponse.Meta.builder().totalCount(1).build())
                .build();
    }

    private void setupMockWebClient(KakaoPlaceResponse response) throws Exception {
        // WebClient chain mocking
        when(mockWebClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(java.util.function.Function.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);
        
        // 1. KakaoPlaceResponse를 JSON 문자열로 변환
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonString = objectMapper.writeValueAsString(response);
        
        // 2. String.class Mock 설정 (서비스가 실제 호출하는 것)
        Mono<String> stringMono = Mono.just(jsonString);
        when(responseSpec.bodyToMono(String.class)).thenReturn(stringMono);
    }
}