package com.example.wherewego.domain.places.service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.GooglePlaceResponse;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 구글 Places API 서비스
 *
 * Text Search API와 Place Details API를 사용하여 장소 검색 및 상세 정보를 제공합니다.
 * 최종적으로 PlaceDetailResponse로 변환하여 기존 API 명세와 호환성을 유지합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GooglePlaceService implements PlaceSearchService {

	private final WebClient googleWebClient;

	@Value("${google.api.key}")
	private String googleApiKey;

	// API 엔드포인트 상수
	private static final String TEXT_SEARCH_ENDPOINT = "/textsearch/json";
	private static final String PLACE_DETAILS_ENDPOINT = "/details/json";
	private static final int DEFAULT_TIMEOUT_SECONDS = 10;

	@Override
	public List<PlaceDetailResponse> searchPlaces(PlaceSearchRequest request) {
		log.info("구글 장소 검색 시작 - 키워드: {}", request.getQuery());

		// 구글 Text Search API 호출
		GooglePlaceResponse googleResponse = callTextSearchApi(request);

		if (googleResponse == null || googleResponse.getResults() == null) {
			log.warn("구글 API 응답이 비어있습니다");
			return Collections.emptyList();
		}

		// 검색 결과를 PlaceDetailResponse로 변환
		Double userLat = getUserLatitude(request);
		Double userLon = getUserLongitude(request);

		List<PlaceDetailResponse> results = convertToPlaceDetailResponses(googleResponse, userLat, userLon);

		log.info("구글 장소 검색 완료 - 결과 수: {}", results.size());
		return results;
	}

	@Override
	public PlaceDetailResponse getPlaceDetail(String placeId) {
		log.info("구글 장소 상세 조회 시작 - placeId: {}", placeId);

		// TODO: Place Details API 호출 구현
		log.warn("Place Details API 구현 예정");
		return null;
	}

	/**
	 * 구글 Text Search API 호출
	 */
	private GooglePlaceResponse callTextSearchApi(PlaceSearchRequest request) {
		log.debug("구글 Text Search API 호출 시작");

		return googleWebClient.get()
			.uri(uriBuilder -> {
				uriBuilder.path(TEXT_SEARCH_ENDPOINT)
					.queryParam("query", request.getQuery())
					.queryParam("key", googleApiKey);

				// 위치 기반 검색 파라미터 추가
				if (request.getUserLocation() != null) {
					Double lat = request.getUserLocation().getLatitude();
					Double lng = request.getUserLocation().getLongitude();
					Integer radius = request.getUserLocation().getRadius();

					if (lat != null && lng != null) {
						// location bias 추가 (검색 결과 우선순위)
						uriBuilder.queryParam("location", lat + "," + lng);

						if (radius != null && radius > 0) {
							// 반경 설정 (미터 단위, 최대 50000m)
							int limitedRadius = Math.min(radius, 50000);
							uriBuilder.queryParam("radius", limitedRadius);
						}
					}
				}

				// 언어 설정 (한국어)
				uriBuilder.queryParam("language", "ko");

				// 지역 설정 (한국)
				uriBuilder.queryParam("region", "kr");

				return uriBuilder.build();
			})
			.retrieve()
			.bodyToMono(GooglePlaceResponse.class)
			.timeout(Duration.ofSeconds(DEFAULT_TIMEOUT_SECONDS))
			.doOnSuccess(response -> {
				if (response != null) {
					log.debug("구글 API 호출 성공 - 상태: {}, 결과수: {}",
						response.getStatus(),
						response.getResults() != null ? response.getResults().size() : 0);
				}
			})
			.doOnError(error -> {
				log.error("구글 API 호출 실패", error);
				throw new CustomException(ErrorCode.EXTERNAL_API_ERROR);
			})
			.onErrorMap(throwable -> {
				if (throwable instanceof CustomException) {
					return throwable;
				}
				log.error("구글 Text Search API 호출 중 예상치 못한 오류", throwable);
				return new CustomException(ErrorCode.EXTERNAL_API_ERROR);
			})
			.block();
	}

	/**
	 * GooglePlaceResponse를 PlaceDetailResponse 목록으로 변환
	 */
	private List<PlaceDetailResponse> convertToPlaceDetailResponses(GooglePlaceResponse googleResponse,
		Double userLat, Double userLon) {

		if (googleResponse.getResults() == null) {
			return Collections.emptyList();
		}

		return googleResponse.getResults().stream()
			.filter(Objects::nonNull)
			.map(result -> convertToPlaceDetailResponse(result, userLat, userLon))
			.filter(Objects::nonNull)
			.collect(Collectors.toList());
	}

	/**
	 * 개별 GooglePlaceResult를 PlaceDetailResponse로 변환
	 */
	private PlaceDetailResponse convertToPlaceDetailResponse(
		GooglePlaceResponse.PlaceResult result, Double userLat, Double userLon) {

		PlaceDetailResponse.PlaceDetailResponseBuilder builder = PlaceDetailResponse.builder()
			.placeId(result.getPlaceId())
			.name(result.getName())
			.category(extractCategory(result.getTypes()))
			.address(result.getFormattedAddress())
			.roadAddress(null) // 구글은 roadAddress 구분 없음
			.phone(null) // Text Search에는 전화번호 없음 (Details에서 가져와야 함)
			.latitude(getLatitudeFromGeometry(result))
			.longitude(getLongitudeFromGeometry(result))
			.averageRating(0.0) // 우리 서비스 평점 (추후 계산)
			.reviewCount(0) // 우리 서비스 리뷰 수 (추후 계산)
			.googleRating(result.getRating()) // 구글 평점
			.placeUrl(null) // Text Search에는 URL 없음
			.bookmarkCount(0) // 추후 계산
			.isBookmarked(false); // 추후 계산

		// 거리 계산
		if (userLat != null && userLon != null) {
			Double placeLat = getLatitudeFromGeometry(result);
			Double placeLon = getLongitudeFromGeometry(result);

			if (placeLat != null && placeLon != null) {
				int distance = calculateDistance(userLat, userLon, placeLat, placeLon);
				builder.distance(distance);
			}
		}

		// 지역 정보 설정 (구글 formatted_address에서 추출)
		PlaceDetailResponse.Region region = extractRegionFromAddress(result.getFormattedAddress());
		builder.region(region);

		// 지역 요약 생성
		String regionSummary = generateRegionSummary(region);
		builder.regionSummary(regionSummary);

		return builder.build();
	}

	/**
	 * 구글 types에서 카테고리 추출
	 */
	private String extractCategory(List<String> types) {
		if (types == null || types.isEmpty()) {
			return "기타";
		}

		// 구글 타입을 한국어 카테고리로 매핑
		for (String type : types) {
			switch (type.toLowerCase()) {
				case "restaurant":
					return "음식점";
				case "cafe":
					return "카페";
				case "gas_station":
					return "주유소";
				case "hospital":
					return "병원";
				case "pharmacy":
					return "약국";
				case "bank":
					return "은행";
				case "atm":
					return "ATM";
				case "convenience_store":
					return "편의점";
				case "shopping_mall":
					return "쇼핑몰";
				case "tourist_attraction":
					return "관광명소";
				case "lodging":
					return "숙박";
				case "movie_theater":
					return "영화관";
				case "gym":
					return "헬스장";
				case "beauty_salon":
					return "미용실";
				case "car_wash":
					return "세차장";
				case "parking":
					return "주차장";
				default:
					continue;
			}
		}

		// 매핑되지 않는 경우 첫 번째 타입 사용
		return types.get(0);
	}

	/**
	 * Geometry에서 위도 추출
	 */
	private Double getLatitudeFromGeometry(GooglePlaceResponse.PlaceResult result) {
		if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
			return result.getGeometry().getLocation().getLat();
		}
		return null;
	}

	/**
	 * Geometry에서 경도 추출
	 */
	private Double getLongitudeFromGeometry(GooglePlaceResponse.PlaceResult result) {
		if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
			return result.getGeometry().getLocation().getLng();
		}
		return null;
	}

	/**
	 * 두 지점 간 거리 계산 (미터 단위)
	 */
	private int calculateDistance(double lat1, double lon1, double lat2, double lon2) {
		final int EARTH_RADIUS = 6371000; // 지구 반지름 (미터)

		double lat1Rad = Math.toRadians(lat1);
		double lat2Rad = Math.toRadians(lat2);
		double deltaLat = Math.toRadians(lat2 - lat1);
		double deltaLon = Math.toRadians(lon2 - lon1);

		double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(lat1Rad) * Math.cos(lat2Rad) *
				Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return (int)(EARTH_RADIUS * c);
	}

	/**
	 * 구글 주소에서 지역 정보 추출 (간소화 버전)
	 * 
	 * 띄어쓰기로 split해서 앞의 2개만 사용:
	 * - "서울특별시 강남구 역삼동 123-45" → depth1: 서울특별시, depth2: 강남구
	 * - "경기도 성남시 분당구 정자동 178-1" → depth1: 경기도, depth2: 성남시
	 */
	private PlaceDetailResponse.Region extractRegionFromAddress(String formattedAddress) {
		if (formattedAddress == null || formattedAddress.trim().isEmpty()) {
			return createDefaultRegion();
		}

		log.debug("주소 파싱 시작: {}", formattedAddress);
		
		// 주소를 공백으로 분할해서 앞의 2개만 사용
		String[] addressParts = formattedAddress.trim().split("\\s+");
		
		String depth1 = addressParts.length > 0 ? addressParts[0] : "알 수 없음";
		String depth2 = addressParts.length > 1 ? addressParts[1] : "알 수 없음"; 

		PlaceDetailResponse.Region region = PlaceDetailResponse.Region.builder()
			.depth1(depth1)
			.depth2(depth2)
			.build();

		log.debug("주소 파싱 완료: {} -> depth1={}, depth2={}", 
			formattedAddress, region.getDepth1(), region.getDepth2());
		
		return region;
	}


	/**
	 * 기본 지역 정보 생성
	 */
	private PlaceDetailResponse.Region createDefaultRegion() {
		return PlaceDetailResponse.Region.builder()
			.depth1("알 수 없음")
			.depth2("알 수 없음")
			.build();
	}

	/**
	 * 지역 요약 문자열 생성
	 * 
	 * 예시:
	 * - "서울특별시 강남구" -> "서울 강남구"
	 * - "경기도 성남시" -> "경기 성남시"
	 * - "부산광역시 해운대구" -> "부산 해운대구"
	 */
	private String generateRegionSummary(PlaceDetailResponse.Region region) {
		if (region == null) {
			return "알 수 없음";
		}

		StringBuilder summary = new StringBuilder();

		// depth1 처리 (시/도 단순화)
		if (region.getDepth1() != null && !"알 수 없음".equals(region.getDepth1())) {
			String depth1 = simplifyProvinceName(region.getDepth1());
			summary.append(depth1);
		}

		// depth2 처리 (시/군/구)
		if (region.getDepth2() != null && !"알 수 없음".equals(region.getDepth2())) {
			if (summary.length() > 0) {
				summary.append(" ");
			}
			summary.append(region.getDepth2());
		}

		// 결과가 비어있으면 기본값 반환
		String result = summary.toString().trim();
		return result.isEmpty() ? "알 수 없음" : result;
	}

	/**
	 * 시/도명 단순화
	 */
	private String simplifyProvinceName(String provinceName) {
		if (provinceName == null) {
			return "";
		}

		return provinceName
			.replace("특별시", "")
			.replace("광역시", "")
			.replace("특별자치시", "")
			.replace("특별자치도", "")
			.replace("도", "");
	}

	// 유틸리티 메서드들
	private Double getUserLatitude(PlaceSearchRequest request) {
		return (request.getUserLocation() != null) ? request.getUserLocation().getLatitude() : null;
	}

	private Double getUserLongitude(PlaceSearchRequest request) {
		return (request.getUserLocation() != null) ? request.getUserLocation().getLongitude() : null;
	}
}