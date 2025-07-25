package com.example.wherewego.domain.places.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 북마크 삭제 응답 DTO
 * 
 * 사용 API: DELETE /api/places/{placeId}/bookmark
 * 
 * 전체 응답 예시:
 * {
 *   "success": true,
 *   "message": "북마크 제거 성공",
 *   "data": {
 *     "isBookmarked": false
 *   },
 *   "timestamp": "2025-07-24T22:04:22.199842"
 * }
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookmarkDeleteResponseDto {
    
    /**
     * 북마크 상태 (삭제 후에는 항상 false)
     */
    private Boolean isBookmarked;
}