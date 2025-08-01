package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 코스 좋아요 응답 DTO
 * 코스에 좋아요를 등록할 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class CourseLikeResponseDto {
    /**
     * 좋아요 고유 식별자
     */
    private Long id; // likeId
    /**
     * 좋아요를 누른 사용자 ID
     */
    private Long userId;
    /**
     * 좋아요를 받은 코스 ID
     */
    private Long courseId;
}
