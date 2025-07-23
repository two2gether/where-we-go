package com.example.wherewego.domain.courses.dto.response;

import lombok.Getter;

@Getter
public class CourseLikeResponseDto {
    private Long id; // likeId
    private Long userId;
    private Long courseId;

    public CourseLikeResponseDto(Long id, Long userId, Long courseId) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
    }
}
