package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CourseLikeListResponseDto {
    private Long id;
    private Long userId;
    private CourseListResponseDto courseListDto;

}