package com.example.wherewego.domain.places.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 북마크 추가 응답 DTO
 *
 * 응답 예시 (POST /api/places/{placeId}/bookmark):
 * {
 *    "bookmarkId": 12345,
 *    "isBookmarked": true
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkCreateResponseDto {

	private Long bookmarkId;
	private Boolean isBookmarked;
}