package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CourseLikeResponseDto {
    private Long id; // likeId
    private Long userId;
    private Long courseId;
}
