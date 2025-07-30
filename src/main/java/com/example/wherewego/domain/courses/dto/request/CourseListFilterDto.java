package com.example.wherewego.domain.courses.dto.request;

import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseListFilterDto {
	@NotBlank(message = "지역은 필수입니다.")
	private String region;
	private List<CourseTheme> themes;
}
