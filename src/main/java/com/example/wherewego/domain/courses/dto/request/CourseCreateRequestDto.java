package com.example.wherewego.domain.courses.dto.request;

import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCreateRequestDto {

	@NotEmpty(message = "장소 선택은 필수입니다.")
	private List<String> placeIds;

	@NotBlank(message = "제목은 필수입니다.")
	private String title;

	private String description;

	@Size(max = 5, message = "테마는 최대 5개까지 선택 가능합니다.")
	private List<CourseTheme> themes;

	@NotBlank(message = "지역은 필수입니다.")
	private String region;

	// 기본값 = false(null일 경우)
	private Boolean isPublic;
}
