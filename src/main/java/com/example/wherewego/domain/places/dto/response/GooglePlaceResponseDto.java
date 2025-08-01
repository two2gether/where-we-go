package com.example.wherewego.domain.places.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 구글 Places API Text Search 응답 DTO
 *
 * 구글 API에서 반환하는 장소 검색 결과를 매핑하는 클래스입니다.
 * Text Search API를 통해 키워드 기반 장소 검색 시 사용됩니다.
 *
 * 응답 형식 예시:
 * {
 *   "results": [
 *     {
 *       "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
 *       "name": "스타벅스 강남점",
 *       "formatted_address": "서울 강남구 강남대로 390",
 *       "geometry": {
 *         "location": {
 *           "lat": 37.498095,
 *           "lng": 127.027610
 *         }
 *       },
 *       "types": ["cafe", "establishment"],
 *       "rating": 4.4,
 *       "user_ratings_total": 1234,
 *       "price_level": 2
 *     }
 *   ],
 *   "status": "OK",
 *   "next_page_token": "Aap_uEBdpk4OiVqSZ..."
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GooglePlaceResponseDto {

	/** 장소 검색 결과 목록 */
	@JsonProperty("results")
	private List<PlaceResult> results;

	/** API 요청 상태 (OK, ZERO_RESULTS, OVER_QUERY_LIMIT 등) */
	@JsonProperty("status")
	private String status;

	/** 다음 페이지 조회용 토큰 */
	@JsonProperty("next_page_token")
	private String nextPageToken;

	/**
	 * 개별 장소 정보
	 * 구글 Text Search API에서 반환하는 각 장소의 기본 정보를 담습니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class PlaceResult {

		/** 구글 장소 고유 ID (영구 식별자) */
		@JsonProperty("place_id")
		private String placeId;

		/** 장소명 */
		@JsonProperty("name")
		private String name;

		/** 구글에서 제공하는 포맷된 주소 */
		@JsonProperty("formatted_address")
		private String formattedAddress;

		/** 위치 정보 (좌표, 뷰포트) */
		@JsonProperty("geometry")
		private Geometry geometry;

		/** 장소 타입 목록 (restaurant, cafe, tourist_attraction 등) */
		@JsonProperty("types")
		private List<String> types;

		/** 구글 평균 평점 (1.0~5.0) */
		@JsonProperty("rating")
		private Double rating;

		/** 구글 총 평가 수 */
		@JsonProperty("user_ratings_total")
		private Integer userRatingsTotal;

		/** 가격 수준 (0~4, 0=무료, 4=매우비쌈) */
		@JsonProperty("price_level")
		private Integer priceLevel;

		/** 장소 사진 목록 */
		@JsonProperty("photos")
		private List<Photo> photos;

		/** 영업시간 정보 */
		@JsonProperty("opening_hours")
		private OpeningHours openingHours;

		/** Plus Code (구글 위치 코드) */
		@JsonProperty("plus_code")
		private PlusCode plusCode;
	}

	/**
	 * 장소 위치 정보
	 * 좌표와 지도 표시 범위 정보를 담습니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Geometry {

		/** 장소의 정확한 좌표정보 */
		@JsonProperty("location")
		private Location location;

		/** 지도 표시용 추천 뷰포트 범위 */
		@JsonProperty("viewport")
		private Viewport viewport;
	}

	/**
	 * GPS 좌표 정보
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Location {

		/** 위도 */
		@JsonProperty("lat")
		private Double lat;

		/** 경도 */
		@JsonProperty("lng")
		private Double lng;
	}

	/**
	 * 지도 뷰포트 정보
	 * 지도에서 장소를 표시할 때 추천되는 화면 범위입니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Viewport {

		@JsonProperty("northeast")
		private Location northeast;

		@JsonProperty("southwest")
		private Location southwest;
	}

	/**
	 * 장소 사진 정보
	 * 구글에서 제공하는 장소 사진의 메타데이터입니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Photo {

		@JsonProperty("height")
		private Integer height;

		@JsonProperty("width")
		private Integer width;

		@JsonProperty("photo_reference")
		private String photoReference;

		@JsonProperty("html_attributions")
		private List<String> htmlAttributions;
	}

	/**
	 * 장소 영업시간 정보
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class OpeningHours {

		@JsonProperty("open_now")
		private Boolean openNow;

		@JsonProperty("weekday_text")
		private List<String> weekdayText;
	}

	/**
	 * 구글 Plus Code 정보
	 * 구글의 전세계 위치 코드 시스템입니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class PlusCode {

		@JsonProperty("compound_code")
		private String compoundCode;

		@JsonProperty("global_code")
		private String globalCode;
	}
}