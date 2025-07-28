package com.example.wherewego.domain.places.service;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriBuilder;

import com.example.wherewego.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.request.PlaceSearchRequest;
import com.example.wherewego.domain.places.dto.response.KakaoPlaceResponse;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponse;
import com.example.wherewego.global.exception.CustomException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
// @Service  // 카카오 API 비활성화
@RequiredArgsConstructor
public class KakaoPlaceService implements PlaceSearchService {

	private static final String SEARCH_ENDPOINT = "/v2/local/search/keyword.json";
	private static final int DEFAULT_TIMEOUT_SECONDS = 10;
	private final WebClient kakaoWebClient;

	@Override
	public List<PlaceDetailResponse> searchPlaces(PlaceSearchRequest request) {

		try {
			// 정렬 설정 - 위치 정보가 있을 때만 distance 사용
			final String sort;
			if (request.getSort() != null) {
				sort = request.getSort();
			} else {
				// 위치 정보가 있으면 distance, 없으면 accuracy 사용
				sort = (request.getUserLocation() != null &&
					request.getUserLocation().getLatitude() != null &&
					request.getUserLocation().getLongitude() != null) ? "distance" : "accuracy";
			}

			// pagination 설정
			final int page = (request.getPagination() != null && request.getPagination().getPage() != null)
				? request.getPagination().getPage() : 1;
			final int size = (request.getPagination() != null && request.getPagination().getSize() != null)
				? request.getPagination().getSize() : 15;

			// userLocation
			final Integer radius;
			final Double userLat;
			final Double userLon;

			if (request.getUserLocation() != null) {
				radius = request.getUserLocation().getRadius() != null
					? request.getUserLocation().getRadius() : 1000;
				userLat = request.getUserLocation().getLatitude();
				userLon = request.getUserLocation().getLongitude();
			} else {
				radius = null;
				userLat = null;
				userLon = null;
			}

			// 🔍 먼저 원본 JSON 응답을 String으로 받기
			String rawJsonResponse = kakaoWebClient.get()
				.uri(uriBuilder -> {
					UriBuilder builder = uriBuilder
						.path(SEARCH_ENDPOINT)
						.queryParam("query", request.getQuery())
						.queryParam("size", size)
						.queryParam("page", page)
						.queryParam("sort", sort);

					// 위치 기반 검색 파라미터 추가
					if (userLat != null && userLon != null) {
						builder.queryParam("x", userLon);        // 경도
						builder.queryParam("y", userLat);        // 위도
						builder.queryParam("radius", radius);
					}

					java.net.URI finalUri = builder.build();
					return finalUri;
				})
				.retrieve()
				.bodyToMono(String.class)  // String으로 받기!
				.timeout(Duration.ofSeconds(DEFAULT_TIMEOUT_SECONDS))
				.block();


			// JSON을 객체로 변환
			KakaoPlaceResponse kakaoResponse = parseJsonResponse(rawJsonResponse);


			if (kakaoResponse == null) {
				return Collections.emptyList();
			}

			return convertToPlaceDetailResponses(kakaoResponse, userLat, userLon);
		} catch (CustomException e) {
			// 이미 처리된 예외는 그대로 재전파
			throw e;
		} catch (Exception e) {
			log.error("카카오 API 호출 실패", e);
			throw new CustomException(ErrorCode.EXTERNAL_API_ERROR);
		}
	}

	@Override
	public PlaceDetailResponse getPlaceDetail(String placeId) {
		// TODO: 향후 단일 장소 상세 조회 API 구현 시 사용
		// 현재는 검색 API를 통해서만 장소 정보 조회
		return null;
	}

	/**
	 * 카카오 API 응답을 내부 DTO로 변환
	 * 거리 계산은 PlaceService에서 별도로 처리됩니다.
	 */
	private List<PlaceDetailResponse> convertToPlaceDetailResponses(KakaoPlaceResponse kakaoResponse,
		Double userLat, Double userLon) {

		if (kakaoResponse == null || kakaoResponse.getDocuments() == null) {
			return Collections.emptyList();
		}

		return kakaoResponse.getDocuments().stream()
			.map(document -> convertToPlaceDetailResponse(document, userLat, userLon))
			.filter(Objects::nonNull)
			.collect(Collectors.toList());

	}

	/**
	 * 개별 장소 문서를 내부 DTO로 변환
	 * 거리 계산은 PlaceService에서 별도로 처리됩니다.
	 */
	private PlaceDetailResponse convertToPlaceDetailResponse(
		KakaoPlaceResponse.PlaceDocument document, Double userLat, Double userLon) {

		PlaceDetailResponse.PlaceDetailResponseBuilder builder = PlaceDetailResponse.builder()
				.placeId(document.getId())  // 카카오 API place_id 직접 사용
				.name(document.getPlaceName())
				.category(document.getCategoryGroupName())  // category_group_name 직접 사용
				.address(document.getAddressName())
				.roadAddress(document.getRoadAddressName())
				.phone(document.getPhone())
				.latitude(parseDouble(document.getLatitude()))
				.longitude(parseDouble(document.getLongitude()))
				.placeUrl(document.getPlaceUrl())
				.averageRating(0.0)  // 기본값, 통계 없을 때
				.reviewCount(0)     // 기본값, 통계 없을 때
				.bookmarkCount(0)
				.isBookmarked(false);

			// 지역 정보 매핑
			PlaceDetailResponse.Region region = PlaceDetailResponse.Region.builder()
				.depth1(document.getRegion1DepthName())
				.depth2(document.getRegion2DepthName())
				.build();
			builder.region(region);

			// regionSummary 생성 (예: "서울 강남구")
			String regionSummary = generateRegionSummary(
				document.getRegion1DepthName(),
				document.getRegion2DepthName()
			);
			builder.regionSummary(regionSummary);

			// 거리 계산은 상위 서비스에서 처리

		try {
			return builder.build();
		} catch (Exception e) {
			log.warn("장소 변환 실패 - ID: {}", document.getId(), e);
			return null;
		}
	}

	/**
	 * 문자열을 Double로 안전하게 변환
	 */
	private Double parseDouble(String value) {
		if (value == null || value.trim().isEmpty()) {
			return null;
		}
		
		try {
			return Double.parseDouble(value);
		} catch (NumberFormatException e) {
			log.warn("Double 변환 실패: {}", value);
			return null;
		}
	}

	/**
	 * 지역 요약 문자열 생성 (예: "서울 강남구")
	 */
	private String generateRegionSummary(String depth1, String depth2) {
		if (depth1 == null && depth2 == null) {
			return "";
		}

		// "특별시", "광역시", "도" 등 제거하고 간단하게 표시
		String simplifiedDepth1 = simplifyRegionName(depth1);

		if (simplifiedDepth1 != null && depth2 != null) {
			return simplifiedDepth1 + " " + depth2;
		} else if (simplifiedDepth1 != null) {
			return simplifiedDepth1;
		} else {
			return depth2;
		}
	}

	/**
	 * 지역명 단순화 (서울특별시 → 서울)
	 */
	private String simplifyRegionName(String regionName) {
		if (regionName == null) {
			return null;
		}

		return regionName
			.replace("특별시", "")
			.replace("광역시", "")
			.replace("특별자치시", "")
			.replace("특별자치도", "")
			.replace("도", "")
			.trim();
	}
	
	/**
	 * JSON 응답을 안전하게 파싱
	 */
	private KakaoPlaceResponse parseJsonResponse(String rawJsonResponse) {
		try {
			com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
			return objectMapper.readValue(rawJsonResponse, KakaoPlaceResponse.class);
		} catch (Exception e) {
			log.error("JSON 파싱 에러", e);
			throw new CustomException(ErrorCode.EXTERNAL_API_ERROR);
		}
	}

}
