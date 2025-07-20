package com.example.wherewego.domain.places.service;

import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

/**
 * 실제 카카오 API 응답을 확인하기 위한 테스트
 * 주의: 실제 API를 호출하므로 API 사용량에 포함됩니다!
 */
@SpringBootTest
public class KakaoApiTestRunner {

    @Autowired
    private KakaoPlaceService kakaoPlaceService;
    
    @Autowired
    private org.springframework.web.reactive.function.client.WebClient kakaoWebClient;

    @Test
    @DisplayName("카카오 API 실제 응답 확인")
    void kakaoApi_RealResponse_Check() {
        // Given: 간단한 검색 요청
        PlaceSearchRequest request = PlaceSearchRequest.builder()
            .query("스타벅스")
            .pagination(PlaceSearchRequest.Pagination.builder()
                .page(1)
                .size(3)  // 3개만 가져오기
                .build())
            .build();

        // When: 실제 API 호출
        System.out.println("🚀 카카오 API 호출 시작...");
        List<PlaceDetailResponse> results = kakaoPlaceService.searchPlaces(request);

        // Then: 결과 확인
        System.out.println("📋 최종 변환된 결과:");
        System.out.println("결과 개수: " + results.size());
        
        results.forEach(place -> {
            System.out.println("------------------");
            System.out.println("장소명: " + place.getName());
            System.out.println("카테고리: " + place.getCategory());
            System.out.println("주소: " + place.getAddress());
            System.out.println("전화번호: " + place.getPhone());
            System.out.println("위도: " + place.getLatitude() + ", 경도: " + place.getLongitude());
            System.out.println("------------------");
        });
    }

    @Test
    @DisplayName("위치 기반 검색 테스트")
    void locationBased_Search_Test() {
        // Given: 위치 정보 포함 검색
        PlaceSearchRequest request = PlaceSearchRequest.builder()
            .query("카페")
            .userLocation(PlaceSearchRequest.UserLocation.builder()
                .latitude(37.5665) // 시청 위도
                .longitude(126.9780) // 시청 경도
                .radius(1000) // 1km 반경
                .build())
            .pagination(PlaceSearchRequest.Pagination.builder()
                .page(1)
                .size(3)
                .build())
            .build();

        // When: 위치 기반 검색
        System.out.println("📍 위치 기반 검색 시작...");
        List<PlaceDetailResponse> results = kakaoPlaceService.searchPlaces(request);

        // Then: 거리 정보도 확인
        System.out.println("📋 위치 기반 검색 결과:");
        results.forEach(place -> {
            System.out.println("장소명: " + place.getName() + " | 거리: " + place.getDistance() + "m");
        });
    }

    @Test
    @DisplayName("카카오 API 원본 JSON 확인")
    void kakaoApi_RawJson_Check() {
        // 카카오 API에서 받은 순수한 JSON 응답을 확인
        System.out.println("🔍 카카오 API 원본 JSON 응답 확인...");
        
        String rawJsonResponse = kakaoWebClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/v2/local/search/keyword.json")
                .queryParam("query", "스타벅스")
                .queryParam("size", 3)
                .queryParam("page", 1)
                .build())
            .retrieve()
            .bodyToMono(String.class)
            .block();
            
        System.out.println("=== 원본 JSON 응답 ===");
        System.out.println(rawJsonResponse);
        System.out.println("===================");
    }

    @Test
    @DisplayName("다양한 키워드 카테고리 비교")
    void variousKeywords_Category_Comparison() {
        System.out.println("🔍 다양한 키워드로 카테고리 비교 테스트...");
        
        String[] keywords = {"음식점", "카페", "한식", "중식", "병원", "마트", "편의점", "주유소"};
        
        for (String keyword : keywords) {
            System.out.println("\n=== \"" + keyword + "\" 검색 결과 ===");
            
            PlaceSearchRequest request = PlaceSearchRequest.builder()
                .query(keyword)
                .pagination(PlaceSearchRequest.Pagination.builder()
                    .page(1)
                    .size(3)
                    .build())
                .build();
                
            List<PlaceDetailResponse> results = kakaoPlaceService.searchPlaces(request);
            
            System.out.println("검색 결과 개수: " + results.size());
            
            for (int i = 0; i < results.size(); i++) {
                PlaceDetailResponse place = results.get(i);
                System.out.println("  " + (i+1) + ". " + place.getName());
                System.out.println("     변환된 카테고리: " + place.getCategory());
            }
            System.out.println("------------------");
        }
    }

    @Test
    @DisplayName("키워드별 원본 응답 카테고리 확인")
    void keywordBased_RawResponse_Category_Check() {
        System.out.println("🔍 키워드별 원본 카테고리 필드 확인...");
        
        String[] keywords = {"음식점", "카페", "한식", "병원"};
        
        for (String keyword : keywords) {
            System.out.println("\n=== \"" + keyword + "\" 원본 카테고리 정보 ===");
            
            String rawJsonResponse = kakaoWebClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/v2/local/search/keyword.json")
                    .queryParam("query", keyword)
                    .queryParam("size", 2)  // 2개만 확인
                    .queryParam("page", 1)
                    .build())
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            // JSON 파싱해서 카테고리 정보만 추출
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(rawJsonResponse);
                com.fasterxml.jackson.databind.JsonNode documents = root.get("documents");
                
                if (documents != null && documents.isArray()) {
                    for (int i = 0; i < Math.min(2, documents.size()); i++) {
                        com.fasterxml.jackson.databind.JsonNode doc = documents.get(i);
                        String placeName = doc.get("place_name").asText();
                        String categoryName = doc.get("category_name").asText();
                        String categoryGroupName = doc.get("category_group_name").asText();
                        
                        System.out.println("  " + (i+1) + ". " + placeName);
                        System.out.println("     category_name: " + categoryName);
                        System.out.println("     category_group_name: " + categoryGroupName);
                        System.out.println();
                    }
                }
            } catch (Exception e) {
                System.out.println("JSON 파싱 에러: " + e.getMessage());
            }
        }
    }
    
}