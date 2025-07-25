package com.example.wherewego.domain.places.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 사용자 북마크 목록 응답 DTO
 * 
 * 사용 API: GET /api/places/users/bookmarks
 * 
 * 전체 응답 예시:
 * {
 *   "success": true,
 *   "message": "북마크 목록 조회 성공",
 *   "data": {
 *     "content": [
 *       {
 *         "bookmarkId": 12345,
 *         "place": {
 *           "placeId": "ChIJn6Nu-3OkfDURFidBwPXoZ5A",
 *           "name": "스타벅스 강남구청정문점",
 *           "category": "카페",
 *           "regionSummary": "서울 강남구",
 *           "address": "대한민국 서울특별시 강남구 학동로 419",
 *           "latitude": 37.5182675,
 *           "longitude": 127.0459628,
 *           "distance": 123,
 *           "averageRating": 4.2,
 *           "reviewCount": 156,
 *           "googleRating": 4.3,
 *           "isBookmarked": true,
 *           "photo": null
 *         },
 *         "createdAt": "2025-07-24T09:30:00"
 *       }
 *     ],
 *     "totalElements": 25,
 *     "totalPages": 2,
 *     "size": 20,
 *     "number": 0
 *   },
 *   "timestamp": "2025-07-24T22:04:22.199842"
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBookmarkListDto {

	private List<BookmarkItem> content;
	private Long totalElements;
	private Integer totalPages;
	private Integer size;
	private Integer number;

	/**
	 * 북마크 아이템 DTO
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class BookmarkItem {
		private Long bookmarkId;
		private PlaceDetailResponse place;
		private LocalDateTime createdAt;
	}
}