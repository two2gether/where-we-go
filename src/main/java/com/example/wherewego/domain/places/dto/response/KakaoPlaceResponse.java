package com.example.wherewego.domain.places.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;


/**
 * 카카오 로컬 API 응답 DTO
 *
 * 이 클래스는 카카오 API에서 반환하는 JSON 응답을 Java 객체로 매핑합니다.
 *
 * 카카오 API 응답 예시:
 * {
 *   "documents": [
 *     {
 *       "id": "8394734",
 *       "place_name": "스타벅스 강남점",
 *       "category_name": "음식점 > 카페 > 커피전문점 > 스타벅스",
 *       "phone": "02-508-3361",
 *       "address_name": "서울 강남구 강남대로 390",
 *       "road_address_name": "서울 강남구 강남대로 390",
 *       "region_1depth_name": "서울",
 *       "region_2depth_name": "강남구",
 *       "region_3depth_name": "역삼동",
 *       "x": "127.027610",
 *       "y": "37.498095",
 *       "place_url": "http://place.map.kakao.com/8394734",
 *       "distance": "418"
 *     }
 *   ],
 *   "meta": {
 *     "total_count": 45,
 *     "pageable_count": 45,
 *     "is_end": false
 *   }
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KakaoPlaceResponse {

    @JsonProperty("documents")
    private List<PlaceDocument> documents;

    @JsonProperty("meta")
    private Meta meta;

    /**
     * 개별 장소 정보를 담는 내부 클래스
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlaceDocument {

        @JsonProperty("id")
        private String id;
        
        @JsonProperty("place_name")
        private String placeName;
        
        @JsonProperty("category_name")
        private String categoryName;
        
        @JsonProperty("category_group_code")
        private String categoryGroupCode;
        
        @JsonProperty("category_group_name")
        private String categoryGroupName;
        
        @JsonProperty("phone")
        private String phone;
        
        @JsonProperty("address_name")
        private String addressName;
        
        @JsonProperty("road_address_name")
        private String roadAddressName;
        
        @JsonProperty("region_1depth_name")
        private String region1DepthName;
        
        @JsonProperty("region_2depth_name")
        private String region2DepthName;
        
        @JsonProperty("region_3depth_name")
        private String region3DepthName;
        
        @JsonProperty("x")
        private String longitude;
        
        @JsonProperty("y")
        private String latitude;
        
        @JsonProperty("place_url")
        private String placeUrl;
        
        @JsonProperty("distance")
        private String distance;

    }

    /**
     * 검색 결과 메타 정보를 담는 내부 클래스
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Meta {

        @JsonProperty("total_count")
        private Integer totalCount;
        
        @JsonProperty("is_end")
        private Boolean isEnd;
        
        @JsonProperty("pageable_count")
        private Integer pageableCount;
        
        @JsonProperty("same_name")
        private SameName sameName;
    }
    
    /**
     * 동명 지역 정보를 담는 내부 클래스
     */
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SameName {
        
        @JsonProperty("region")
        private java.util.List<String> region;
        
        @JsonProperty("keyword")
        private String keyword;
        
        @JsonProperty("selected_region")
        private String selectedRegion;
    }


}