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
import com.example.wherewego.domain.places.dto.response.GooglePlaceResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;

/**
 * Google Text Search API 전용 서비스
 *
 * Text Search API 호출과 검색 결과 처리만을 담당하는 특화 서비스입니다.
 * 검색 쿼리 구성, API 호출, 결과 변환 등 검색 관련 로직을 집중 관리합니다.
 */
@Slf4j
@Service
public class GooglePlaceSearchService {

	// API 엔드포인트 상수
	private static final String TEXT_SEARCH_ENDPOINT = "/textsearch/json";
	private static final int DEFAULT_TIMEOUT_SECONDS = 10;

	private final WebClient googleWebClient;
	private final GooglePlaceConverter googlePlaceConverter;

	@Value("${google.api.key}")
	private String googleApiKey;

	public GooglePlaceSearchService(@Qualifier("googleWebClient") WebClient googleWebClient,
									GooglePlaceConverter googlePlaceConverter) {
		this.googleWebClient = googleWebClient;
		this.googlePlaceConverter = googlePlaceConverter;
	}

	/**
	 * 구글 Places API를 사용하여 장소를 검색합니다.
	 * Text Search API를 호출하여 검색 결과를 PlaceDetailResponse 형태로 변환합니다.
	 * 검색 결과는 캐싱되어 동일한 검색 조건에 대해 빠른 응답을 제공합니다.
	 *
	 * @param request 장소 검색 요청 정보 (검색어, 위치, 페이지 등)
	 * @return 검색된 장소 목록 (PlaceDetailResponse 형태로 변환)
	 * @throws CustomException 구글 API 호출 실패 시
	 */
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
		List<PlaceDetailResponseDto> results = convertToPlaceDetailResponses(googleResponse);

		log.info("Google Places API 검색 완료 - 결과 수: {}", results.size());
		return results;
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
			.doOnError(error -> log.error("구글 API 호출 실패", error))
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
	 * @return 변환된 장소 상세 정보 목록
	 */
	private List<PlaceDetailResponseDto> convertToPlaceDetailResponses(GooglePlaceResponseDto googleResponse) {
		if (googleResponse.getResults() == null) {
			return Collections.emptyList();
		}

		return googleResponse.getResults().stream()
			.filter(Objects::nonNull)
			.map(result -> googlePlaceConverter.convertToPlaceDetailResponse(result))
			.filter(Objects::nonNull)
			.collect(Collectors.toList());
	}

}