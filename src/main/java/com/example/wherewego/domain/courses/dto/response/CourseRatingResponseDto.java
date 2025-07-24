package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CourseRatingResponseDto {
    private Long id; // ratingId
    private Long userId;
    private Long courseId;
    private int rating;
}
