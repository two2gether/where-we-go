package com.example.wherewego.domain.courses.dto.response;

import lombok.Getter;

@Getter
public class CourseRatingResponseDto {
    private Long id; // ratingId
    private Long userId;
    private Long courseId;
    private int rating;

    public CourseRatingResponseDto(Long id, Long userId, Long courseId, int rating) {
        this.id = id;
        this.userId = userId;
        this.courseId = courseId;
        this.rating = rating;
    }
}
