package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CourseBookmarkResponseDto {
    private Long id; // courseBookmarkId
    private Long userId;
    private Long courseId;
}