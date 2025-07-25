package com.example.wherewego.domain.places.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 상세 정보 응답 DTO
 *
 * 클라이언트에게 반환할 표준화된 장소 정보를 담는 클래스입니다.
 * Google Maps API 응답을 통일된 형태로 변환하며, 이중 평점 시스템을 지원합니다.
 *
 * 사용 API:
 * - 장소 검색: POST /api/places/search
 * - 장소 상세 조회: GET /api/places/{placeId}/details
 * - 북마크 목록 조회: GET /api/places/users/bookmarks (place 필드로 포함)
 *
 * 응답 예시:
 * {
 *   "placeId": "ChIJn6Nu-3OkfDURFidBwPXoZ5A",
 *   "name": "스타벅스 강남구청정문점",
 *   "category": "카페",
 *   "regionSummary": "서울 강남구",
 *   "region": {
 *     "depth1": "서울특별시",
 *     "depth2": "강남구"
 *   },
 *   "address": "대한민국 서울특별시 강남구 학동로 419",
 *   "roadAddress": null,
 *   "phone": "1522-3232",
 *   "latitude": 37.5182675,
 *   "longitude": 127.0459628,
 *   "distance": 123,
 *   "averageRating": 4.2,     // 우리 서비스 내부 평점
 *   "reviewCount": 156,       // 우리 서비스 리뷰 수
 *   "googleRating": 4.3,      // 구글 평점 (참고용)
 *   "placeUrl": "https://maps.google.com/?cid=10405541606252947222",
 *   "bookmarkCount": 89,
 *   "isBookmarked": false,
 *   "photo": "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=CmRaAAAA...&key=API_KEY"
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class PlaceDetailResponse {

	private String placeId;            // 장소 고유 ID (구글 place_id)
	private String name;               // 장소명
	private String category;           // 카테고리
	private String regionSummary;      // 지역 요약 (예: "서울 강남구")
	private Region region;             // 상세 행정구역 정보
	private String address;            // 기본 주소
	private String roadAddress;        // 도로명 주소
	private String phone;              // 전화번호
	private Double latitude;           // 위도
	private Double longitude;          // 경도
	private Integer distance;          // 사용자 위치로부터 거리(미터)
	private Double averageRating;      // 우리 서비스 평점 (0.0~5.0)
	private Integer reviewCount;       // 우리 서비스 리뷰 수
	private Double googleRating;       // 구글 평점 (1.0~5.0, 참고용)
	private String placeUrl;           // 구글 맵스 URL
	private Integer bookmarkCount;     // 총 북마크 수
	private Boolean isBookmarked;      // 현재 사용자 북마크 여부
	private String photo;              // 장소 대표 사진 URL

	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class Region {
		private String depth1;  // 1단계 행정구역 (시/도)
		private String depth2;  // 2단계 행정구역 (시/군/구)
	}
}
