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
 * 응답 예시 (GET /api/users/bookmarks):
 * {
 *   "success": true,
 *   "message": "북마크 목록 조회 성공",
 *   "data": {
 *     "content": [
 *       {
 *         "bookmarkId": 12345,
 *         "place": {
 *           "placeId": "253451",
 *           "name": "스타벅스 강남점",
 *           "category": "카페",
 *           "regionSummary": "서울 강남구",
 *           "address": "서울 강남구 강남대로 390",
 *           "latitude": 37.498095,
 *           "longitude": 127.027610,
 *           "distance": 123,
 *           "averageRating": 4.2,
 *           "reviewCount": 156
 *         },
 *         "createdAt": "2025-01-15T09:30:00"
 *       }
 *     ],
 *     "totalElements": 25,
 *     "totalPages": 2,
 *     "size": 20,
 *     "number": 0
 *   },
 *   "timestamp": "2025-01-20T10:30:00Z"
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