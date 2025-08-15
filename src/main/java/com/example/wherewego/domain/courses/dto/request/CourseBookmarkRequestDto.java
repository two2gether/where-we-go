package com.example.wherewego.domain.courses.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CourseBookmarkRequestDto {

    @NotNull
    private Long courseId;
}
