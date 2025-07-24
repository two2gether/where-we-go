package com.example.wherewego.domain.places.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 북마크 삭제 응답 DTO
 * 
 * API 명세서에 따른 북마크 삭제 시 반환 데이터
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