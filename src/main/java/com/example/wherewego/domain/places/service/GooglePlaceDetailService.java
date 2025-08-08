package com.example.wherewego.domain.places.service;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.wherewego.domain.common.enums.ErrorCode;
import com.example.wherewego.domain.places.dto.response.GooglePlaceDetailResponseDto;
import com.example.wherewego.domain.places.dto.response.PlaceDetailResponseDto;
import com.example.wherewego.global.exception.CustomException;

import lombok.extern.slf4j.Slf4j;

/**
 * Google Place Details API 전용 서비스
 * 
 * Place Details API 호출과 응답 처리만을 담당하는 특화 서비스입니다.
 * 캐싱, 예외 처리, 타임아웃 관리 등 API 호출 관련 로직을 집중 관리합니다.
 */
@Slf4j
@Service
public class GooglePlaceDetailService {

    // API 엔드포인트 상수
    private static final String PLACE_DETAILS_ENDPOINT = "/details/json";
    private static final int DEFAULT_TIMEOUT_SECONDS = 10;

    private final WebClient googleWebClient;
    private final GooglePlaceConverter googlePlaceConverter;

    @Value("${google.api.key}")
    private String googleApiKey;

    public GooglePlaceDetailService(@Qualifier("googleWebClient") WebClient googleWebClient,
                                    GooglePlaceConverter googlePlaceConverter) {
        this.googleWebClient = googleWebClient;
        this.googlePlaceConverter = googlePlaceConverter;
    }

    /**
     * 구글 Places API를 사용하여 특정 장소의 상세 정보를 조회합니다.
     * Place Details API를 호출하여 장소의 전체 정보를 가져옵니다.
     *
     * @param placeId 조회할 장소의 고유 ID (구글 Places API에서 제공)
     * @return 장소의 상세 정보 (PlaceDetailResponse 형태로 변환)
     * @throws CustomException 구글 API 호출 실패 또는 장소를 찾을 수 없는 경우
     */
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
        PlaceDetailResponseDto result = googlePlaceConverter.convertToPlaceDetailResponse(detailResponse.getResult());
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
        return googleWebClient.get()
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
    }
}