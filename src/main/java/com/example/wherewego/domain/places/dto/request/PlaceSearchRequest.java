package com.example.wherewego.domain.places.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
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
 * 클라이언트가 장소 검색 시 보내는 요청 데이터를 담는 클래스입니다.
 *
 * 요청 예시:
 * {
 *   "query": "스타벅스",
 *   "category": "카페",
 *   "region": {
 *     "depth1": "서울특별시",
 *     "depth2": "강남구",
 *     "depth3": "역삼동"
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
 *   "sort": "distance",
 *   "apiProvider": "auto"
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSearchRequest {

	@NotBlank(message = "검색 키워드는 필수입니다")
	@Size(min = 1, max = 100, message = "검색 키워드는 1-100자 이내여야 합니다")
	private String query;

	@Size(max = 50, message = "카테고리는 50자 이하여야 합니다")
	private String category;

	@Valid
	private Region region;

	@Valid
	private UserLocation userLocation;

	@Valid
	private Pagination pagination;

	private String sort;

	private String apiProvider;

	/**
	 * 지역 정보를 담는 내부 클래스
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class Region {

		@Size(max = 50, message = "1단계 행정구역은 50자 이하여야 합니다")
		private String depth1;

		@Size(max = 50, message = "2단계 행정구역은 50자 이하여야 합니다")
		private String depth2;

		@Size(max = 50, message = "3단계 행정구역은 50자 이하여야 합니다")
		private String depth3;
	}

	/**
	 * 사용자 위치 정보를 담는 내부 클래스
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class UserLocation {

		@NotNull(message = "위도는 필수입니다")
		@DecimalMin(value = "33.0", message = "위도는 33.0 이상이어야 합니다")
		@DecimalMax(value = "43.0", message = "위도는 43.0 이하여야 합니다")
		private Double latitude;

		@NotNull(message = "경도는 필수입니다")
		@DecimalMin(value = "124.0", message = "경도는 124.0 이상이어야 합니다")
		@DecimalMax(value = "132.0", message = "경도는 132.0 이하여야 합니다")
		private Double longitude;

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

		@Min(value = 1, message = "페이지 번호는 1 이상이어야 합니다")
		private Integer page;

		@Min(value = 1, message = "페이지 크기는 1 이상이어야 합니다")
		@Max(value = 45, message = "페이지 크기는 45 이하여야 합니다")
		private Integer size;
	}
}
