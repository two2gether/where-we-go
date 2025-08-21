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
 *   "query": "서울 강남구 스타벅스"
 * }
 *
 * 위치 기반 검색 요청 예시:
 * {
 *   "query": "서울 강남구 스타벅스",
 *   "userLocation": {
 *     "latitude": 37.498011,
 *     "longitude": 127.020102,
 *     "radius": 2000
 *   }
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceSearchRequestDto {

	/**
	 * 장소 검색 키워드 (1-100자)
	 * 프론트엔드에서 "카테고리 + 지역 + 검색어" 형태로 조합된 문자열
	 */
	@NotBlank(message = "검색 키워드는 필수입니다")
	@Size(min = 1, max = 100, message = "검색 키워드는 1-100자 이내여야 합니다")
	private String query;

	/**
	 * 장소 카테고리 (선택사항)
	 * Google Places API의 type 파라미터로 사용됩니다.
	 * 예: "restaurant", "cafe", "tourist_attraction" 등
	 */
	@Size(max = 50, message = "카테고리는 50자 이하여야 합니다")
	private String category;

	/**
	 * 사용자 현재 위치 정보 (선택사항)
	 * 제공된 경우 Google API의 location, radius 파라미터로 사용됩니다.
	 */
	@Valid
	private UserLocation userLocation;

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
}
