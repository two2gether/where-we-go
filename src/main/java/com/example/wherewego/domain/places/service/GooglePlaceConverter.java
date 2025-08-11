package com.example.wherewego.domain.places.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.wherewego.domain.places.dto.response.GooglePlaceDetailResponseDto;
import com.example.wherewego.domain.places.dto.response.GooglePlaceResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;

import lombok.extern.slf4j.Slf4j;

/**
 * Google Places API 응답 데이터를 애플리케이션 표준 형식으로 변환하는 컨버터
 * 
 * Text Search API와 Place Details API 응답을 PlaceDetailResponseDto로 통일된 형식으로 변환합니다.
 * 지역 정보 파싱, 카테고리 번역, 사진 URL 생성 등의 변환 로직을 담당합니다.
 */
@Slf4j
@Component
public class GooglePlaceConverter {

    @Value("${google.api.key}")
    private String googleApiKey;

    /**
     * Google Place Details를 PlaceDetailResponse로 변환
     */
    public PlaceDetailResponseDto convertToPlaceDetailResponse(GooglePlaceDetailResponseDto.PlaceDetail detail) {
        if (detail == null) {
            return null;
        }

        PlaceDetailResponseDto.PlaceDetailResponseDtoBuilder builder = PlaceDetailResponseDto.builder()
            .placeId(detail.getPlaceId())
            .name(detail.getName())
            .address(detail.getFormattedAddress())
            .averageRating(0.0)  // 우리 서비스 평점 (기본값)
            .reviewCount(0)      // 우리 서비스 리뷰 수 (기본값)
            .bookmarkCount(0)    // 북마크 수 (기본값)
            .isBookmarked(false) // 기본값 (실제로는 사용자별로 설정)
            .googleRating(detail.getRating()); // 구글 평점

        // 위치 정보 추출
        if (detail.getGeometry() != null && detail.getGeometry().getLocation() != null) {
            GooglePlaceResponseDto.Location location = detail.getGeometry().getLocation();
            builder.latitude(location.getLat())
                .longitude(location.getLng());
        }

        // 카테고리 정보 추출 (types에서 첫 번째 유의미한 타입 사용)
        String category = extractMainCategory(detail.getTypes());
        builder.category(category);

        // 주소 구성 요소에서 지역 정보 추출
        if (detail.getAddressComponents() != null && !detail.getAddressComponents().isEmpty()) {
            // address_components로 지역 정보 추출
            PlaceDetailResponseDto.Region region = extractRegionFromComponents(detail.getAddressComponents());
            builder.region(region);

            // regionSummary 생성
            String regionSummary = generateRegionSummary(region);
            builder.regionSummary(regionSummary);
        } else {
            log.debug("address_components 누락, formatted_address 사용");
            // fallback: formatted_address에서 파싱
            PlaceDetailResponseDto.Region region = extractRegionFromAddress(detail.getFormattedAddress());
            builder.region(region);

            String regionSummary = generateRegionSummary(region);
            builder.regionSummary(regionSummary);
        }

        // 사진 정보 추출
        String photoUrl = extractPhotoUrl(detail.getPhotos());
        builder.photo(photoUrl);

        return builder.build();
    }

    /**
     * 구글 검색 결과의 개별 장소를 애플리케이션 표준 형식으로 변환합니다.
     * Text Search API 응답의 각 장소를 PlaceDetailResponse로 변환합니다.
     */
    public PlaceDetailResponseDto convertToPlaceDetailResponse(GooglePlaceResponseDto.PlaceResult result) {
        PlaceDetailResponseDto.PlaceDetailResponseDtoBuilder builder = PlaceDetailResponseDto.builder()
            .placeId(result.getPlaceId())
            .name(result.getName())
            .category(extractMainCategory(result.getTypes()))
            .address(result.getFormattedAddress())
            .roadAddress(null) // 구글은 roadAddress 구분 없음
            .latitude(getLatitudeFromGeometry(result))
            .longitude(getLongitudeFromGeometry(result))
            .averageRating(0.0) // 우리 서비스 평점 (추후 계산)
            .reviewCount(0) // 우리 서비스 리뷰 수 (추후 계산)
            .googleRating(result.getRating()) // 구글 평점
            .bookmarkCount(0) // 추후 계산
            .isBookmarked(false); // 추후 계산

        // 지역 정보 설정 (구글 formatted_address에서 추출)
        PlaceDetailResponseDto.Region region = extractRegionFromAddress(result.getFormattedAddress());
        builder.region(region);

        // 지역 요약 생성
        String regionSummary = generateRegionSummary(region);
        builder.regionSummary(regionSummary);

        // 사진 정보 추가 (Text Search의 경우 제한적)
        String photoUrl = extractPhotoUrl(result.getPhotos());
        builder.photo(photoUrl);

        return builder.build();
    }

    /**
     * Google types 배열에서 주요 카테고리 추출 및 한국어 번역
     * Text Search와 Place Details 모두에서 사용하는 통합 메서드
     */
    public String extractMainCategory(List<String> types) {
        if (types == null || types.isEmpty()) {
            return "기타";
        }

        // 우선순위가 높은 카테고리부터 확인
        String[] priorityTypes = {
            "restaurant", "cafe", "hospital", "pharmacy", "bank", "atm",
            "gas_station", "convenience_store", "shopping_mall", "store",
            "tourist_attraction", "lodging", "movie_theater", "gym",
            "beauty_salon", "car_wash", "parking", "school", "park"
        };

        for (String priorityType : priorityTypes) {
            if (types.contains(priorityType)) {
                return translateToKorean(priorityType);
            }
        }

        // 우선순위에 없는 경우 첫 번째 유의미한 타입 사용
        for (String type : types) {
            if (!"establishment".equals(type) && !"point_of_interest".equals(type)) {
                return translateToKorean(type);
            }
        }

        return "기타";
    }

    /**
     * 영어 카테고리를 한국어로 번역
     */
    private String translateToKorean(String englishCategory) {
        return switch (englishCategory.toLowerCase()) {
            case "restaurant" -> "음식점";
            case "cafe" -> "카페";
            case "hospital" -> "병원";
            case "pharmacy" -> "약국";
            case "bank" -> "은행";
            case "atm" -> "ATM";
            case "gas_station" -> "주유소";
            case "convenience_store" -> "편의점";
            case "shopping_mall" -> "쇼핑몰";
            case "store" -> "상점";
            case "tourist_attraction" -> "관광명소";
            case "lodging" -> "숙박";
            case "movie_theater" -> "영화관";
            case "gym" -> "헬스장";
            case "beauty_salon" -> "미용실";
            case "car_wash" -> "세차장";
            case "parking" -> "주차장";
            case "school" -> "학교";
            case "park" -> "공원";
            default -> "기타";
        };
    }

    /**
     * 주소 구성 요소에서 지역 정보 추출 (1,2단계 행정구역만)
     * Google API 행정구역 매핑:
     * - administrative_area_level_1: 시/도 (서울특별시, 경기도)
     * - sublocality_level_1 or locality: 시/군/구 (강남구, 수원시)
     */
    public PlaceDetailResponseDto.Region extractRegionFromComponents(
        List<GooglePlaceDetailResponseDto.AddressComponent> components) {
        String depth1 = null;  // 시/도
        String depth2 = null;  // 구/군/시

        for (GooglePlaceDetailResponseDto.AddressComponent component : components) {
            List<String> types = component.getTypes();

            if (types.contains("administrative_area_level_1")) {
                depth1 = component.getLongName();
            } else if (types.contains("sublocality_level_1") || types.contains("locality")) {
                depth2 = component.getLongName();
            }
        }

        return PlaceDetailResponseDto.Region.builder()
            .depth1(depth1)
            .depth2(depth2)
            .build();
    }

    /**
     * 지역 요약 문자열 생성 (1,2단계 행정구역만 활용)
     * 생성 규칙: "시/도 구/군" (예: "서울 강남구", "경기 파주시")
     */
    public String generateRegionSummary(PlaceDetailResponseDto.Region region) {
        if (region == null) {
            return "";
        }

        StringBuilder summary = new StringBuilder();

        // 1단계: 시/도 (단순화)
        String depth1 = simplifyRegionName(region.getDepth1());
        if (depth1 != null && !depth1.trim().isEmpty()) {
            summary.append(depth1);
        }

        // 2단계: 구/군/시
        String depth2 = region.getDepth2();
        if (depth2 != null && !depth2.trim().isEmpty()) {
            if (!summary.isEmpty()) {
                summary.append(" ");
            }
            summary.append(depth2);
        }

        String result = summary.toString().trim();
        return result.isEmpty() ? "" : result;
    }

    /**
     * Google Places API 사진 정보를 URL로 변환 (비용생각해서 1개만)
     */
    public String extractPhotoUrl(List<GooglePlaceResponseDto.Photo> photos) {
        if (photos == null || photos.isEmpty()) {
            return null;
        }

        // 첫 번째 사진만 사용
        String photoReference = photos.get(0).getPhotoReference();
        return buildPhotoUrl(photoReference);
    }

    /**
     * Google Places Photos API URL 생성
     */
    private String buildPhotoUrl(String photoReference) {
        if (photoReference == null || photoReference.trim().isEmpty()) {
            return null;
        }

        return String.format(
            "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=%s&key=%s",
            photoReference,
            googleApiKey
        );
    }

    /**
     * 지역명 단순화 (서울특별시 → 서울)
     */
    public String simplifyRegionName(String regionName) {
        if (regionName == null || regionName.trim().isEmpty()) {
            return null;
        }

        return regionName.trim()
            .replace("특별시", "")
            .replace("광역시", "")
            .replace("특별자치시", "")
            .replace("특별자치도", "")
            .replace("도", "")
            .trim();
    }

    /**
     * Text Search API용: formatted_address에서 지역 정보 추출
     */
    public PlaceDetailResponseDto.Region extractRegionFromAddress(String formattedAddress) {
        if (formattedAddress == null || formattedAddress.trim().isEmpty()) {
            return createDefaultRegion();
        }

        // 주소를 공백으로 분할
        String[] addressParts = formattedAddress.trim().split("\\s+");

        String depth1 = null;
        String depth2 = null;

        // 모든 주소에서 depth2까지만 파싱 (일관성 유지)
        if (addressParts.length >= 2) {
            String part1 = addressParts[0];
            String part2 = addressParts[1];

            if (isProvince(part1) && isDistrict(part2)) {
                depth1 = part1;
                depth2 = part2;
            }
        }

        // fallback: 기본 split 방식
        if (depth1 == null && addressParts.length > 0) {
            depth1 = addressParts[0];
        }
        if (depth2 == null && addressParts.length > 1) {
            depth2 = addressParts[1];
        }

        return PlaceDetailResponseDto.Region.builder()
            .depth1(depth1)
            .depth2(depth2)
            .build();
    }

    /**
     * 구글 API 응답의 geometry 객체에서 위도 정보를 안전하게 추출합니다.
     */
    public Double getLatitudeFromGeometry(GooglePlaceResponseDto.PlaceResult result) {
        if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
            return result.getGeometry().getLocation().getLat();
        }
        return null;
    }

    /**
     * 구글 API 응답의 geometry 객체에서 경도 정보를 안전하게 추출합니다.
     */
    public Double getLongitudeFromGeometry(GooglePlaceResponseDto.PlaceResult result) {
        if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
            return result.getGeometry().getLocation().getLng();
        }
        return null;
    }

    /**
     * 주어진 텍스트가 시/도 단위 행정구역인지 판별합니다.
     */
    private boolean isProvince(String text) {
        return text.endsWith("특별시") || text.endsWith("광역시") ||
            text.endsWith("특별자치시") || text.endsWith("도") || text.endsWith("특별자치도");
    }

    /**
     * 주어진 텍스트가 구/군/시 단위 행정구역인지 판별합니다.
     */
    private boolean isDistrict(String text) {
        return text.endsWith("구") || text.endsWith("군") || text.endsWith("시");
    }

    /**
     * 지역 정보를 추출할 수 없는 경우 사용할 기본 지역 객체를 생성합니다.
     */
    private PlaceDetailResponseDto.Region createDefaultRegion() {
        return PlaceDetailResponseDto.Region.builder()
            .depth1(null)
            .depth2(null)
            .build();
    }
}