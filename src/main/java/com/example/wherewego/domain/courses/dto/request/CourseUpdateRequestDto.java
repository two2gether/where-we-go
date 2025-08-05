package com.example.wherewego.domain.courses.dto.request;

import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 수정 요청 DTO
 * 기존 여행 코스의 정보를 수정할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseUpdateRequestDto {

	/**
	 * 수정할 코스 제목
	 */
	@NotBlank(message = "제목은 필수입니다.")
	private String title;

	/**
	 * 수정할 코스 설명
	 */
	private String description;

	/**
	 * 수정할 코스 테마 목록 (최대 5개)
	 */
	@Size(max = 5, message = "테마는 최대 5개까지 선택 가능합니다.")
	private List<CourseTheme> themes;

	/**
	 * 수정할 코스의 지역 정보
	 */
	@NotBlank(message = "지역은 필수입니다.")
	private String region;

	/**
	 * 수정할 코스 공개 여부 (기본값: false)
	 */
	// 기본값 = false(null일 경우)
	private Boolean isPublic;
}
