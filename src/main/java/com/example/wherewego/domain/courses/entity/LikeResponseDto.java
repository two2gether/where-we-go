package com.example.wherewego.domain.courses.entity;

import lombok.Getter;

@Getter
public class LikeResponseDto {
    private Long id; // likeId
    private Long userId;
    private Long courseId;

    public LikeResponseDto(Long id, Long userId, Long courseId) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
    }
}
