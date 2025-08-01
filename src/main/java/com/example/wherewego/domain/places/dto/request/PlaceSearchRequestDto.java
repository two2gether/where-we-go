package com.example.wherewego.domain.places.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 검색 요청 DTO
 *
 * 사용 API: POST /api/places/search
 *
 * 클라이언트가 장소 검색 시 보내는 요청 데이터를 담는 클래스입니다.
 * Google Places API Text Search를 통해 실시간 장소 검색을 수행합니다.
 *
 * 기본 검색 요청 예시:
 * {
 *   "query": "스타벅스 강남구청정문점"
 * }
 *
 * 위치 기반 검색 요청 예시:
 * {
 *   "query": "스타벅스 강남구청정문점",
 *   "userLocation": {
 *     "latitude": 37.498011,
 *     "longitude": 127.020102,
 *     "radius": 2000
 *   }
 * }
 *
 * 전체 옵션 포함 요청 예시:
 * {
 *   "query": "강남 스타벅스",
 *   "region": {
 *     "depth1": "서울특별시",
 *     "depth2": "강남구"
 *   },
 *   "userLocation": {
 *     "latitude": 37.5665,
 *     "longitude": 126.9780,
 *     "radius": 1000
 *   },
 *   "pagination": {
 *     "page": 1,
 *     "size": 15
 *   },
 *   "sort": "distance"
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSearchRequestDto {

	/**
	 * 장소 검색 키워드 (1-100자)
	 */
	@NotBlank(message = "검색 키워드는 필수입니다")
	@Size(min = 1, max = 100, message = "검색 키워드는 1-100자 이내여야 합니다")
	private String query;

	/**
	 * 검색 대상 지역 정보
	 */
	@Valid
	private Region region;

	/**
	 * 사용자 현재 위치 정보
	 */
	@Valid
	private UserLocation userLocation;

	/**
	 * 페이지네이션 정보
	 */
	@Valid
	private Pagination pagination;

	/**
	 * 정렬 방식 (distance: 거리순, relevance: 연관도순)
	 */
	private String sort;

	/**
	 * 지역 정보를 담는 내부 클래스
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class Region {

		/**
		 * 1단계 행정구역 (예: 서울특별시)
		 */
		@Size(max = 50, message = "1단계 행정구역은 50자 이하여야 합니다")
		private String depth1;

		/**
		 * 2단계 행정구역 (예: 강남구)
		 */
		@Size(max = 50, message = "2단계 행정구역은 50자 이하여야 합니다")
		private String depth2;

	}

	/**
	 * 사용자 위치 정보를 담는 내부 클래스
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class UserLocation {

		/**
		 * 사용자 위치의 위도 (33.0 ~ 43.0)
		 */
		@NotNull(message = "위도는 필수입니다")
		@DecimalMin(value = "33.0", message = "위도는 33.0 이상이어야 합니다")
		@DecimalMax(value = "43.0", message = "위도는 43.0 이하여야 합니다")
		private Double latitude;

		/**
		 * 사용자 위치의 경도 (124.0 ~ 132.0)
		 */
		@NotNull(message = "경도는 필수입니다")
		@DecimalMin(value = "124.0", message = "경도는 124.0 이상이어야 합니다")
		@DecimalMax(value = "132.0", message = "경도는 132.0 이하여야 합니다")
		private Double longitude;

		/**
		 * 검색 반경 (m 단위, 100 ~ 20000)
		 */
		@Min(value = 100, message = "검색 반경은 100m 이상이어야 합니다")
		@Max(value = 20000, message = "검색 반경은 20km 이하여야 합니다")
		private Integer radius;
	}

	/**
	 * 페이징 정보를 담는 내부 클래스
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class Pagination {

		/**
		 * 페이지 번호 (1 이상)
		 */
		@Min(value = 1, message = "페이지 번호는 1 이상이어야 합니다")
		private Integer page;

		/**
		 * 페이지당 결과 수 (1 ~ 45)
		 */
		@Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다")
		@Max(value = 45, message = "페이지 크기는 45 이하여야 합니다")
		private Integer size;
	}
}
