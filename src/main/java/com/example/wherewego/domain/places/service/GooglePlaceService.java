package com.example.wherewego.domain.places.service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.request.PlaceSearchRequestDto;
import com.example.wherewego.domain.places.dto.response.GooglePlaceDetailResponseDto;
import com.example.wherewego.domain.places.dto.response.GooglePlaceResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;

/**
 * 구글 Places API 서비스
 *
 * Text Search API와 Place Details API를 사용하여 장소 검색 및 상세 정보를 제공합니다.
 * 최종적으로 PlaceDetailResponse로 변환하여 기존 API 명세와 호환성을 유지합니다.
 */
@Slf4j
@Service("googlePlaceService")
public class GooglePlaceService implements PlaceSearchService {

	// API 엔드포인트 상수
	private static final String TEXT_SEARCH_ENDPOINT = "/textsearch/json";
	private static final String PLACE_DETAILS_ENDPOINT = "/details/json";
	private static final int DEFAULT_TIMEOUT_SECONDS = 10;

	private final @Qualifier("googleWebClient") WebClient googleWebClient;

	@Value("${google.api.key}")
	private String googleApiKey;

	/**
	 * GooglePlaceService 생성자
	 *
	 * @param googleWebClient 구글 API 호출을 위한 WebClient Bean
	 */
	public GooglePlaceService(@Qualifier("googleWebClient") WebClient googleWebClient) {
		this.googleWebClient = googleWebClient;
	}

	/**
	 * 구글 Places API를 사용하여 장소를 검색합니다.
	 * Text Search API와 Place Details API를 조합하여 상세 정보를 제공합니다.
	 * 검색 결과는 캐싱되어 동일한 검색 조건에 대해 빠른 응답을 제공합니다.
	 *
	 * @param request 장소 검색 요청 정보 (검색어, 위치, 페이지 등)
	 * @return 검색된 장소 목록 (PlaceDetailResponse 형태로 변환)
	 * @throws CustomException 구글 API 호출 실패 시
	 */
	@Override
	@Cacheable(value = "google-place-search", key = "@cacheKeyUtil.generateGoogleSearchKey(#request)")
	public List<PlaceDetailResponseDto> searchPlaces(PlaceSearchRequestDto request) {
		log.info("Google Places API 검색 요청 - 쿼리: {}", request.getQuery());

		// 구글 Text Search API 호출
		GooglePlaceResponseDto googleResponse = callTextSearchApi(request);

		if (googleResponse == null || googleResponse.getResults() == null) {
			log.warn("구글 API 응답이 비어있습니다");
			return Collections.emptyList();
		}

		// 검색 결과를 PlaceDetailResponse로 변환
		Double userLat = getUserLatitude(request);
		Double userLon = getUserLongitude(request);

		List<PlaceDetailResponseDto> results = convertToPlaceDetailResponses(googleResponse, userLat, userLon);

		log.info("Google Places API 검색 완료 - 결과 수: {}", results.size());
		return results;
	}

	/**
	 * Google Place Details를 PlaceDetailResponse로 변환
	 * 거리 계산은 PlaceService에서 별도로 처리됩니다.
	 */
	private PlaceDetailResponseDto convertToPlaceDetailResponse(GooglePlaceDetailResponseDto.PlaceDetail detail) {
		if (detail == null) {
			return null;
		}

		PlaceDetailResponseDto.PlaceDetailResponseDtoBuilder builder = PlaceDetailResponseDto.builder()
			.placeId(detail.getPlaceId())
			.name(detail.getName())
			.address(detail.getFormattedAddress())
			.phone(detail.getFormattedPhoneNumber())
			.placeUrl(detail.getUrl())
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
	 * Google API 행정구역 매핑:
	 * - administrative_area_level_1: 시/도 (서울특별시, 경기도)
	 * - sublocality_level_1 or locality: 시/군/구 (강남구, 수원시)
	 */
	private PlaceDetailResponseDto.Region extractRegionFromComponents(
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
			// sublocality_level_2는 사용하지 않음 (일관성을 위해)
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
	private String generateRegionSummary(PlaceDetailResponseDto.Region region) {
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
	private String extractPhotoUrl(List<GooglePlaceResponseDto.Photo> photos) {
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

	/**
	 * 구글 Places API를 사용하여 특정 장소의 상세 정보를 조회합니다.
	 * Place Details API를 호출하여 장소의 전체 정보를 가져옵니다.
	 *
	 * @param placeId 조회할 장소의 고유 ID (구글 Places API에서 제공)
	 * @return 장소의 상세 정보 (PlaceDetailResponse 형태로 변환)
	 * @throws CustomException 구글 API 호출 실패 또는 장소를 찾을 수 없는 경우
	 */
	@Override
	@Cacheable(value = "google-place-details", key = "@cacheKeyUtil.generateGooglePlaceDetailKey(#placeId)")
	public PlaceDetailResponseDto getPlaceDetail(String placeId) {
		log.info("Google Place Details API 요청 - placeId: {}", placeId);

		GooglePlaceDetailResponseDto detailResponse;
		try {
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
		PlaceDetailResponseDto result = convertToPlaceDetailResponse(detailResponse.getResult());
		log.info("Google Place Details API 완료 - placeId: {}, name: {}", placeId, result.getName());
		return result;
	}

	/**
	 * 구글 Place Details API를 직접 호출하여 원시 응답 데이터를 가져옵니다.
	 *
	 * @param placeId 조회할 장소의 고유 ID
	 * @return 구글 API 원시 응답 데이터
	 */
	private GooglePlaceDetailResponseDto callPlaceDetailsApi(String placeId) {
		// Place Details API 호출

		GooglePlaceDetailResponseDto response = googleWebClient.get()
			.uri(uriBuilder -> {
				java.net.URI finalUri = uriBuilder
					.path(PLACE_DETAILS_ENDPOINT)
					.queryParam("place_id", placeId)
					.queryParam("key", googleApiKey)
					.queryParam("fields",
						"place_id,name,formatted_address,geometry,types,rating,user_ratings_total,price_level,formatted_phone_number,international_phone_number,website,url,opening_hours,address_components,photos")
					.queryParam("language", "ko")  // 한국어 응답
					.build();
				return finalUri;
			})
			.retrieve()
			.bodyToMono(GooglePlaceDetailResponseDto.class)
			.timeout(Duration.ofSeconds(DEFAULT_TIMEOUT_SECONDS))
			.block();

		return response;
	}

	/**
	 * 구글 Text Search API를 호출하여 검색어와 위치 조건에 맞는 장소 목록을 가져옵니다.
	 * 사용자 위치가 제공된 경우 거리 기반 우선순위로 정렬됩니다.
	 *
	 * @param request 검색 요청 정보 (검색어, 사용자 위치, 반경 등)
	 * @return 구글 API 원시 검색 결과 데이터
	 * @throws CustomException API 호출 실패 또는 네트워크 오류 시
	 */
	private GooglePlaceResponseDto callTextSearchApi(PlaceSearchRequestDto request) {
		// Text Search API 호출

		return googleWebClient.get()
			.uri(uriBuilder -> {
				uriBuilder.path(TEXT_SEARCH_ENDPOINT)
					.queryParam("query", request.getQuery())
					.queryParam("key", googleApiKey);

				// 위치 기반 검색 파라미터 추가 (정렬 우선순위용)
				if (request.getUserLocation() != null) {
					Double lat = request.getUserLocation().getLatitude();
					Double lng = request.getUserLocation().getLongitude();
					Integer radius = request.getUserLocation().getRadius();

					if (lat != null && lng != null) {
						// location bias 추가 (거리 기반 검색 결과 우선순위)
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
			.bodyToMono(GooglePlaceResponseDto.class)
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
	 * 구글 Text Search API 응답을 애플리케이션 표준 형식으로 변환합니다.
	 * 검색 결과 목록을 PlaceDetailResponse 목록으로 변환하여 일관된 데이터 구조를 제공합니다.
	 *
	 * @param googleResponse 구글 API 원시 검색 응답
	 * @param userLat 사용자 위치 위도 (거리 계산용, null 가능)
	 * @param userLon 사용자 위치 경도 (거리 계산용, null 가능)
	 * @return 변환된 장소 상세 정보 목록
	 */
	private List<PlaceDetailResponseDto> convertToPlaceDetailResponses(GooglePlaceResponseDto googleResponse,
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
	 * 구글 검색 결과의 개별 장소를 애플리케이션 표준 형식으로 변환합니다.
	 * Text Search API 응답의 각 장소를 PlaceDetailResponse로 변환합니다.
	 *
	 * @param result 구글 API 개별 검색 결과
	 * @param userLat 사용자 위치 위도 (거리 계산용, null 가능)
	 * @param userLon 사용자 위치 경도 (거리 계산용, null 가능)
	 * @return 변환된 장소 상세 정보
	 */
	private PlaceDetailResponseDto convertToPlaceDetailResponse(
		GooglePlaceResponseDto.PlaceResult result, Double userLat, Double userLon) {

		PlaceDetailResponseDto.PlaceDetailResponseDtoBuilder builder = PlaceDetailResponseDto.builder()
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

		// 거리 계산은 PlaceService에서 처리

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
	 * 구글 API 응답의 geometry 객체에서 위도 정보를 안전하게 추출합니다.
	 *
	 * @param result 구글 API 검색 결과
	 * @return 위도 값, geometry 정보가 없는 경우 null
	 */
	private Double getLatitudeFromGeometry(GooglePlaceResponseDto.PlaceResult result) {
		if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
			return result.getGeometry().getLocation().getLat();
		}
		return null;
	}

	/**
	 * 구글 API 응답의 geometry 객체에서 경도 정보를 안전하게 추출합니다.
	 *
	 * @param result 구글 API 검색 결과
	 * @return 경도 값, geometry 정보가 없는 경우 null
	 */
	private Double getLongitudeFromGeometry(GooglePlaceResponseDto.PlaceResult result) {
		if (result.getGeometry() != null && result.getGeometry().getLocation() != null) {
			return result.getGeometry().getLocation().getLng();
		}
		return null;
	}

	/**
	 * Text Search API용: formatted_address에서 지역 정보 추출 (1,2,3단계)
	 * 파싱 규칙:
	 * - "서울특별시 강남구 역삼동 123-45" → depth1: 서울특별시, depth2: 강남구, depth3: 역삼동
	 * - "경기도 성남시 분당구 정자동 178-1" → depth1: 경기도, depth2: 성남시, depth3: 분당구
	 * - "부산광역시 해운대구 우동 1394" → depth1: 부산광역시, depth2: 해운대구, depth3: 우동
	 */
	private PlaceDetailResponseDto.Region extractRegionFromAddress(String formattedAddress) {
		if (formattedAddress == null || formattedAddress.trim().isEmpty()) {
			return createDefaultRegion();
		}

		// 주소에서 지역 정보 추출

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

		// 주소 파싱 완료

		return PlaceDetailResponseDto.Region.builder()
			.depth1(depth1)
			.depth2(depth2)
			.build();
	}

	/**
	 * 주어진 텍스트가 시/도 단위 행정구역인지 판별합니다.
	 *
	 * @param text 판별할 텍스트
	 * @return 시/도 단위인 경우 true, 아닌 경우 false
	 */
	private boolean isProvince(String text) {
		return text.endsWith("특별시") || text.endsWith("광역시") ||
			text.endsWith("특별자치시") || text.endsWith("도") || text.endsWith("특별자치도");
	}

	/**
	 * 주어진 텍스트가 구/군/시 단위 행정구역인지 판별합니다.
	 *
	 * @param text 판별할 텍스트
	 * @return 구/군/시 단위인 경우 true, 아닌 경우 false
	 */
	private boolean isDistrict(String text) {
		return text.endsWith("구") || text.endsWith("군") || text.endsWith("시");
	}

	/**
	 * 주어진 텍스트가 동/읍/면 단위 행정구역인지 판별합니다.
	 * 번지나 도로명은 제외하고 실제 행정구역만 구분합니다.
	 *
	 * @param text 판별할 텍스트
	 * @return 동/읍/면 단위인 경우 true, 아닌 경우 false
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
	 * 지역 정보를 추출할 수 없는 경우 사용할 기본 지역 객체를 생성합니다.
	 *
	 * @return 빈 지역 정보 객체
	 */
	private PlaceDetailResponseDto.Region createDefaultRegion() {
		return PlaceDetailResponseDto.Region.builder()
			.depth1(null)
			.depth2(null)
			.build();
	}

	/**
	 * 검색 요청에서 사용자 위도 정보를 안전하게 추출합니다.
	 *
	 * @param request 검색 요청 객체
	 * @return 사용자 위도, 위치 정보가 없는 경우 null
	 */
	private Double getUserLatitude(PlaceSearchRequestDto request) {
		return (request.getUserLocation() != null) ? request.getUserLocation().getLatitude() : null;
	}

	/**
	 * 검색 요청에서 사용자 경도 정보를 안전하게 추출합니다.
	 *
	 * @param request 검색 요청 객체
	 * @return 사용자 경도, 위치 정보가 없는 경우 null
	 */
	private Double getUserLongitude(PlaceSearchRequestDto request) {
		return (request.getUserLocation() != null) ? request.getUserLocation().getLongitude() : null;
	}
}