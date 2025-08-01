package com.example.wherewego.domain.places.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 구글 Places API Place Details 응답 DTO
 *
 * 특정 장소의 상세 정보를 조회할 때 사용하는 Place Details API의 응답을 매핑합니다.
 * Text Search보다 더 상세한 정보(전화번호, 웹사이트, 리뷰 등)를 제공합니다.
 *
 * 응답 형식 예시:
 * {
 *   "result": {
 *     "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
 *     "name": "스타벅스 강남점",
 *     "formatted_address": "서울 강남구 강남대로 390",
 *     "geometry": {
 *       "location": { "lat": 37.498095, "lng": 127.027610 }
 *     },
 *     "types": ["cafe", "establishment"],
 *     "rating": 4.4,
 *     "user_ratings_total": 1234,
 *     "formatted_phone_number": "02-1234-5678",
 *     "international_phone_number": "+82 2-1234-5678",
 *     "website": "https://www.starbucks.co.kr",
 *     "url": "https://maps.google.com/?cid=13153204942596594755",
 *     "opening_hours": {
 *       "open_now": true,
 *       "weekday_text": ["월요일: 오전 7:00~오후 10:00"]
 *     }
 *   },
 *   "status": "OK"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GooglePlaceDetailResponseDto {

	/** 장소 상세 정보 결과 */
	@JsonProperty("result")
	private PlaceDetail result;

	/** API 요청 상태 (OK, NOT_FOUND 등) */
	@JsonProperty("status")
	private String status;

	/**
	 * 구글 장소 상세 정보
	 * Place Details API에서 반환하는 단일 장소의 모든 상세 데이터를 담습니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class PlaceDetail {

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
		private GooglePlaceResponseDto.Geometry geometry;

		/** 장소 타입 목록 (restaurant, cafe 등) */
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
		private List<GooglePlaceResponseDto.Photo> photos;

		/** 상세 영업시간 정보 */
		@JsonProperty("opening_hours")
		private DetailedOpeningHours openingHours;

		/** 구글 리뷰 목록 */
		@JsonProperty("reviews")
		private List<Review> reviews;

		/** 포맷된 전화번호 (지역 형식) */
		@JsonProperty("formatted_phone_number")
		private String formattedPhoneNumber;

		/** 국제 전화번호 (+82 형식) */
		@JsonProperty("international_phone_number")
		private String internationalPhoneNumber;

		/** 웹사이트 URL */
		@JsonProperty("website")
		private String website;

		/** 구글 맵스 URL */
		@JsonProperty("url")
		private String url;

		/** 주변 지역 정보 */
		@JsonProperty("vicinity")
		private String vicinity;

		/** 주소 구성 요소 목록 */
		@JsonProperty("address_components")
		private List<AddressComponent> addressComponents;

		/** Plus Code (구글 위치 코드) */
		@JsonProperty("plus_code")
		private GooglePlaceResponseDto.PlusCode plusCode;
	}

	/**
	 * 상세 영업시간 정보
	 * 주간별 영업시간과 현재 영업 상태를 포함합니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class DetailedOpeningHours {

		/** 현재 영업 중 여부 */
		@JsonProperty("open_now")
		private Boolean openNow;

		/** 주간별 영업시간 구간 목록 */
		@JsonProperty("periods")
		private List<Period> periods;

		/** 주간별 영업시간 텍스트 */
		@JsonProperty("weekday_text")
		private List<String> weekdayText;
	}

	/**
	 * 영업시간 구간
	 * 하루 내 열고 닫는 시간 정보를 담습니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Period {

		/** 마감 시간 */
		@JsonProperty("close")
		private TimeInfo close;

		/** 오픈 시간 */
		@JsonProperty("open")
		private TimeInfo open;
	}

	/**
	 * 시간 정보
	 * 요일과 시간을 나타내는 정보입니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class TimeInfo {

		/** 요일 (0=일요일, 1=월요일, ..., 6=토요일) */
		@JsonProperty("day")
		private Integer day;

		/** 시간 (HHMM 형식, 예: "0900") */
		@JsonProperty("time")
		private String time;
	}

	/**
	 * 구글 리뷰 정보
	 * 구글 사용자들이 작성한 리뷰 데이터입니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Review {

		/** 리뷰 작성자 이름 */
		@JsonProperty("author_name")
		private String authorName;

		/** 리뷰 작성자 구글 프로필 URL */
		@JsonProperty("author_url")
		private String authorUrl;

		/** 리뷰 언어 코드 (예: "ko", "en") */
		@JsonProperty("language")
		private String language;

		/** 작성자 프로필 사진 URL */
		@JsonProperty("profile_photo_url")
		private String profilePhotoUrl;

		/** 리뷰 평점 (1~5) */
		@JsonProperty("rating")
		private Integer rating;

		/** 상대적 시간 표현 (예: "2개월 전") */
		@JsonProperty("relative_time_description")
		private String relativeTimeDescription;

		/** 리뷰 내용 */
		@JsonProperty("text")
		private String text;

		/** 리뷰 작성 시간 (Unix timestamp) */
		@JsonProperty("time")
		private Long time;
	}

	/**
	 * 주소 구성 요소
	 * 구글에서 제공하는 주소의 각 구성 요소 (시/도, 구/군, 동/읍 등)를 담습니다.
	 */
	@Data
	@Builder
	@NoArgsConstructor
	@AllArgsConstructor
	public static class AddressComponent {

		/** 전체 이름 (예: "서울특별시") */
		@JsonProperty("long_name")
		private String longName;

		/** 축약 이름 (예: "서울") */
		@JsonProperty("short_name")
		private String shortName;

		/** 주소 구성 요소 타입 (administrative_area_level_1 등) */
		@JsonProperty("types")
		private List<String> types;
	}
}