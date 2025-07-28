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
import com.example.wherewego.domain.places.dto.response.GooglePlaceDetailResponse;
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

	// API 엔드포인트 상수
	private static final String TEXT_SEARCH_ENDPOINT = "/textsearch/json";
	private static final String PLACE_DETAILS_ENDPOINT = "/details/json";
	private static final int DEFAULT_TIMEOUT_SECONDS = 10;
	private final WebClient googleWebClient;
	@Value("${google.api.key}")
	private String googleApiKey;

	@Override
	public List<PlaceDetailResponse> searchPlaces(PlaceSearchRequest request) {
		// 구글 Text Search API 호출
		GooglePlaceResponse googleResponse = callTextSearchApi(request);

		if (googleResponse == null || googleResponse.getResults() == null) {
			return Collections.emptyList();
		}

		// 검색 결과를 PlaceDetailResponse로 변환
		Double userLat = getUserLatitude(request);
		Double userLon = getUserLongitude(request);

        return convertToPlaceDetailResponses(googleResponse, userLat, userLon);
	}

	/**
	 * Google Place Details를 PlaceDetailResponse로 변환
	 */
	private PlaceDetailResponse convertToPlaceDetailResponse(GooglePlaceDetailResponse.PlaceDetail detail, boolean isBookmarked) {
		if (detail == null) {
			return null;
		}

		PlaceDetailResponse.PlaceDetailResponseBuilder builder = PlaceDetailResponse.builder()
			.placeId(detail.getPlaceId())
			.name(detail.getName())
			.address(detail.getFormattedAddress())
			.phone(detail.getFormattedPhoneNumber())
			.placeUrl(detail.getUrl())
			.averageRating(0.0)  // 우리 서비스 평점 (기본값)
			.reviewCount(0)      // 우리 서비스 리뷰 수 (기본값)
			.bookmarkCount(0)    // 북마크 수 (기본값)
			.isBookmarked(isBookmarked) // 기본값 (실제로는 사용자별로 설정)
			.googleRating(detail.getRating()); // 구글 평점

		// 위치 정보 추출
		if (detail.getGeometry() != null && detail.getGeometry().getLocation() != null) {
			GooglePlaceResponse.Location location = detail.getGeometry().getLocation();
			builder.latitude(location.getLat())
				.longitude(location.getLng());
		}

		// 카테고리 정보 추출 (types에서 첫 번째 유의미한 타입 사용)
		String category = extractMainCategory(detail.getTypes());
		builder.category(category);

		// 주소 구성 요소에서 지역 정보 추출
		if (detail.getAddressComponents() != null && !detail.getAddressComponents().isEmpty()) {
			log.debug("address_components 사용하여 지역 정보 추출 - 구성요소 수: {}", detail.getAddressComponents().size());
			PlaceDetailResponse.Region region = extractRegionFromComponents(detail.getAddressComponents());
			builder.region(region);

			// regionSummary 생성
			String regionSummary = generateRegionSummary(region);
			builder.regionSummary(regionSummary);
		} else {
			log.warn("⚠️  Place Details API에서 address_components가 null/비어있음 - formatted_address로 fallback: {}",
				detail.getFormattedAddress());
			// fallback: formatted_address에서 파싱
			PlaceDetailResponse.Region region = extractRegionFromAddress(detail.getFormattedAddress());
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
	 * Google types 배열에서 주요 카테고리 추출 및 한국어 번역
	 * Text Search와 Place Details 모두에서 사용하는 통합 메서드
	 */
	private String extractMainCategory(List<String> types) {
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
	 *
	 * Google API 행정구역 매핑:
	 * - administrative_area_level_1: 시/도 (서울특별시, 경기도)
	 * - sublocality_level_1 or locality: 시/군/구 (강남구, 수원시)
	 */
	private PlaceDetailResponse.Region extractRegionFromComponents(
		List<GooglePlaceDetailResponse.AddressComponent> components) {
		String depth1 = null;  // 시/도
		String depth2 = null;  // 구/군/시

		for (GooglePlaceDetailResponse.AddressComponent component : components) {
			List<String> types = component.getTypes();

			if (types.contains("administrative_area_level_1")) {
				depth1 = component.getLongName();
			} else if (types.contains("sublocality_level_1") || types.contains("locality")) {
				depth2 = component.getLongName();
			}
			// sublocality_level_2는 사용하지 않음 (일관성을 위해)
		}

		return PlaceDetailResponse.Region.builder()
			.depth1(depth1)
			.depth2(depth2)
			.build();
	}

	/**
	 * 지역 요약 문자열 생성 (1,2단계 행정구역만 활용)
	 *
	 * 생성 규칙: "시/도 구/군" (예: "서울 강남구", "경기 파주시")
	 */
	private String generateRegionSummary(PlaceDetailResponse.Region region) {
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
	private String extractPhotoUrl(List<GooglePlaceResponse.Photo> photos) {
		if (photos == null || photos.isEmpty()) {
			return null;
		}

		// 첫 번째 사진만 사용
		String photoReference = photos.get(0).getPhotoReference();
		return buildPhotoUrl(photoReference);
	}

	/**
	 * Google Places Photos API URL 생성
	 *
	 * @param photoReference Google API에서 제공하는 사진 참조값
	 * @return 실제 사진을 볼 수 있는 URL
	 */
	private String buildPhotoUrl(String photoReference) {
		if (photoReference == null || photoReference.trim().isEmpty()) {
			return null;
		}

		// Google Places Photos API 사용
		// 참고: https://developers.google.com/maps/documentation/places/web-service/photos
		return String.format(
			"https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=%s&key=%s",
			photoReference,
			googleApiKey
		);
	}

	/**
	 * 지역명 단순화 (서울특별시 → 서울)
	 * Text Search와 Place Details 모두에서 사용하는 통합 메서드
	 */
	private String simplifyRegionName(String regionName) {
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

	@Override
	public PlaceDetailResponse getPlaceDetail(String placeId, boolean isBookmarked) {
		log.info("구글 장소 상세 조회 시작 - placeId: {}", placeId);

		GooglePlaceDetailResponse detailResponse;
		try {
			// Google Place Details API 호출
            detailResponse = callPlaceDetailsApi(placeId);
        } catch (Exception e) {
			log.error("구글 Place Details API 호출 중 예외 발생 - placeId: {}", placeId, e);
			throw new CustomException(ErrorCode.PLACE_API_ERROR);
		}

		if (detailResponse == null || !"OK".equals(detailResponse.getStatus())) {
			log.warn("구글 Place Details API 호출 실패 - placeId: {}, status: {}",
				placeId, detailResponse != null ? detailResponse.getStatus() : "null");
			throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
		}

		if (detailResponse.getResult() == null) {
			log.warn("구글 Place Details 결과가 비어있음 - placeId: {}", placeId);
			throw new CustomException(ErrorCode.PLACE_NOT_FOUND);
		}

		// Google API 응답을 PlaceDetailResponse로 변환
		return convertToPlaceDetailResponse(detailResponse.getResult(), isBookmarked);
	}

	/**
	 * 구글 Place Details API 호출
	 */
	private GooglePlaceDetailResponse callPlaceDetailsApi(String placeId) {
		log.debug("구글 Place Details API 호출 시작 - placeId: {}", placeId);

		GooglePlaceDetailResponse response = googleWebClient.get()
			.uri(uriBuilder -> {
				java.net.URI finalUri = uriBuilder
					.path(PLACE_DETAILS_ENDPOINT)
					.queryParam("place_id", placeId)
					.queryParam("key", googleApiKey)
					.queryParam("fields",
						"place_id,name,formatted_address,geometry,types,rating,user_ratings_total,price_level,formatted_phone_number,international_phone_number,website,url,opening_hours,address_components,photos")
					.queryParam("language", "ko")  // 한국어 응답
					.build();
				log.debug("Google Place Details API URL: {}", finalUri.toString());
				return finalUri;
			})
			.retrieve()
			.bodyToMono(GooglePlaceDetailResponse.class)
			.timeout(Duration.ofSeconds(DEFAULT_TIMEOUT_SECONDS))
			.block();

		// 응답 디버깅
		if (response != null && response.getResult() != null) {
			log.debug("Place Details API 응답 - status: {}, name: {}, address_components count: {}",
				response.getStatus(),
				response.getResult().getName(),
				response.getResult().getAddressComponents() != null ?
					response.getResult().getAddressComponents().size() : "null");

			// address_components 상세 로그
			if (response.getResult().getAddressComponents() != null) {
				for (int i = 0; i < response.getResult().getAddressComponents().size(); i++) {
					var component = response.getResult().getAddressComponents().get(i);
					log.debug("address_component[{}]: longName={}, shortName={}, types={}",
						i, component.getLongName(), component.getShortName(), component.getTypes());
				}
			}
		}

		return response;
	}

	/**
	 * 구글 Text Search API 호출
	 */
	// query = "광화문" & key = "
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
			.category(extractMainCategory(result.getTypes()))
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

		// 사진 정보 추가 (Text Search의 경우 제한적)
		String photoUrl = extractPhotoUrl(result.getPhotos());
		builder.photo(photoUrl);

		return builder.build();
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
	 * 두 지점 간 거리 계산 (미터 단위) - 다른 서비스에서도 사용 가능하도록 public으로 변경
	 */
	@Override
	public Integer calculateDistance(double lat1, double lon1, double lat2, double lon2) {
		final int EARTH_RADIUS = 6371000; // 지구 반지름 (미터)

		double lat1Rad = Math.toRadians(lat1);
		double lat2Rad = Math.toRadians(lat2);
		double deltaLat = Math.toRadians(lat2 - lat1);
		double deltaLon = Math.toRadians(lon2 - lon1);

		double a = getStraightDistanceBetweenXAndY(deltaLat, lat1Rad, lat2Rad, deltaLon);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return (int)(EARTH_RADIUS * c);
	}


	/**
	 * 두 좌표간 직선 거리는 구하는 메소드
	 * @param deltaLat
	 * @param lat1Rad
	 * @param lat2Rad
	 * @param deltaLon
	 * @return
	 */
	private static double getStraightDistanceBetweenXAndY(double deltaLat, double lat1Rad, double lat2Rad, double deltaLon) {
		return Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
				Math.cos(lat1Rad) * Math.cos(lat2Rad) *
						Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
	}

	/**
	 * Text Search API용: formatted_address에서 지역 정보 추출 (1,2,3단계)
	 *
	 * 파싱 규칙:
	 * - "서울특별시 강남구 역삼동 123-45" → depth1: 서울특별시, depth2: 강남구, depth3: 역삼동
	 * - "경기도 성남시 분당구 정자동 178-1" → depth1: 경기도, depth2: 성남시, depth3: 분당구
	 * - "부산광역시 해운대구 우동 1394" → depth1: 부산광역시, depth2: 해운대구, depth3: 우동
	 */
	private PlaceDetailResponse.Region extractRegionFromAddress(String formattedAddress) {
		if (formattedAddress == null || formattedAddress.trim().isEmpty()) {
			return createDefaultRegion();
		}

		log.debug("📍 Text Search 주소 파싱 시작: {}", formattedAddress);

		// 주소를 공백으로 분할
		String[] addressParts = formattedAddress.trim().split("\\s+");

		String depth1 = null;
		String depth2 = null;

		// 모든 주소에서 depth2까지만 파싱 (일관성 유지)
		// 패턴: "경기도 파주시 ..." → depth1: 경기도, depth2: 파주시
		if (addressParts.length >= 2) {
			String part1 = addressParts[0];
			String part2 = addressParts[1];

			if (isProvince(part1) && isDistrict(part2)) {
				depth1 = part1;
				depth2 = part2;
				// depth3은 제거함 (일관성을 위해)
			}
		}

		// fallback: 기본 split 방식
		if (depth1 == null && addressParts.length > 0) {
			depth1 = addressParts[0];
		}
		if (depth2 == null && addressParts.length > 1) {
			depth2 = addressParts[1];
		}

		PlaceDetailResponse.Region region = PlaceDetailResponse.Region.builder()
			.depth1(depth1)
			.depth2(depth2)
			.build();

		log.debug("📍 Text Search 주소 파싱 완료: {} -> depth1={}, depth2={}",
			formattedAddress, region.getDepth1(), region.getDepth2());

		return region;
	}

	/**
	 * 시/도 판별
	 */
	private boolean isProvince(String text) {
		return text.endsWith("특별시") || text.endsWith("광역시") ||
			text.endsWith("특별자치시") || text.endsWith("도") || text.endsWith("특별자치도");
	}

	/**
	 * 구/군/시 판별
	 */
	private boolean isDistrict(String text) {
		return text.endsWith("구") || text.endsWith("군") || text.endsWith("시");
	}

	/**
	 * 동/읍/면 판별
	 */
	private boolean isSubDistrict(String text) {
		// 숫자로 시작하는 것은 번지이므로 제외
		if (text.matches("^\\d.*")) {
			return false;
		}
		// 도로명은 제외 (로, 길, 대로 등)
		if (text.endsWith("로") || text.endsWith("길") || text.endsWith("대로") ||
			text.endsWith("번길") || text.matches(".*로\\d+.*")) {
			return false;
		}
		return text.endsWith("동") || text.endsWith("읍") || text.endsWith("면") ||
			text.endsWith("리") || text.endsWith("가");
	}

	/**
	 * 기본 지역 정보 생성
	 */
	private PlaceDetailResponse.Region createDefaultRegion() {
		return PlaceDetailResponse.Region.builder()
			.depth1(null)
			.depth2(null)
			.build();
	}

	// 유틸리티 메서드들
	private Double getUserLatitude(PlaceSearchRequest request) {
		return (request.getUserLocation() != null) ? request.getUserLocation().getLatitude() : null;
	}

	private Double getUserLongitude(PlaceSearchRequest request) {
		return (request.getUserLocation() != null) ? request.getUserLocation().getLongitude() : null;
	}
}