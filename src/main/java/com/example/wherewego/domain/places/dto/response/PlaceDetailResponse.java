package com.example.wherewego.domain.places.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 상세 정보 응답 DTO
 *
 * 클라이언트에게 반환할 표준화된 장소 정보를 담는 클래스입니다.
 * 카카오, 네이버 등 여러 API의 응답을 통일된 형태로 변환합니다.
 *
 * 응답 예시:
 * {
 *   "placeId": 1,
 *   "apiPlaceId": "253451",
 *   "name": "스타벅스 강남점",
 *   "category": "카페",
 *   "region": {
 *     "depth1": "서울특별시",
 *     "depth2": "강남구",
 *     "depth3": "역삼동"
 *   },
 *   "address": "서울 강남구 강남대로 390",
 *   "roadAddress": "서울 강남구 강남대로 390",
 *   "phone": "02-1234-5678",
 *   "latitude": 37.498095,
 *   "longitude": 127.027610,
 *   "distance": 123,
 *   "placeUrl": "http://place.map.kakao.com/253451",
 *   "bookmarkCount": 23,
 *   "isBookmarked": false
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceDetailResponse {

	private Long placeId;
	private String apiPlaceId;
	private String name;
	private String category;
	private Region region;
	private String address;
	private String roadAddress;
	private String phone;
	private Double latitude;
	private Double longitude;
	private Integer distance;
	private String placeUrl;
	private Integer bookmarkCount;
	private Boolean isBookmarked;

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class Region {
		private String depth1;
		private String depth2;
		private String depth3;
	}
}
