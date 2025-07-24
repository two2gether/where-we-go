package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDeleteResponseDto {
	private Long courseId;
	private LocalDateTime deletedAt;
}
