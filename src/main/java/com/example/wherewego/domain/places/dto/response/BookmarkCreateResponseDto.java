package com.example.wherewego.domain.places.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 북마크 추가 응답 DTO
 * 
 * 사용 API: POST /api/places/{placeId}/bookmark
 * 
 * 전체 응답 예시:
 * {
 *   "success": true,
 *   "message": "북마크 추가 성공",
 *   "data": {
 *     "bookmarkId": 12345,
 *     "isBookmarked": true
 *   },
 *   "timestamp": "2025-07-24T22:04:22.199842"
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkCreateResponseDto {

	/**
	 * 생성된 북마크의 고유 식별자
	 */
	private Long bookmarkId;
	/**
	 * 북마크 상태 (추가 후에는 항상 true)
	 */
	private Boolean isBookmarked;
}