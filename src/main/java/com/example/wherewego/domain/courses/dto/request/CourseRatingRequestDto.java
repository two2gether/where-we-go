package com.example.wherewego.domain.courses.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@AllArgsConstructor
public class CourseRatingRequestDto {

    @NotNull(message = "평점은 필수 입력입니다.")
    @Min(value = 1, message = "평점은 1점이상 5점이하 입니다.")
    @Max(value = 5, message = "평점은 1점이상 5점이하 입니다.")
    private int rating;

}
