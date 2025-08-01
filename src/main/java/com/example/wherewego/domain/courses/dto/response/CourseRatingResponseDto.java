package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 코스 평점 응답 DTO
 * 코스에 평점을 등록할 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class CourseRatingResponseDto {
    /**
     * 평점 고유 식별자
     */
    private Long id; // ratingId
    /**
     * 평점을 등록한 사용자 ID
     */
    private Long userId;
    /**
     * 평점을 받은 코스 ID
     */
    private Long courseId;
    /**
     * 평점 값 (1~5점)
     */
    private int rating;
}
