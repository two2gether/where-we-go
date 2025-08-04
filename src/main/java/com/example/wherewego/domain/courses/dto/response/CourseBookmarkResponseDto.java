package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 코스 북마크 응답 DTO
 * 코스를 북마크에 추가할 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class CourseBookmarkResponseDto {
    /**
     * 코스 북마크 고유 식별자
     */
    private Long id; // courseBookmarkId
    /**
     * 북마크를 등록한 사용자 ID
     */
    private Long userId;
    /**
     * 북마크된 코스 ID
     */
    private Long courseId;
}