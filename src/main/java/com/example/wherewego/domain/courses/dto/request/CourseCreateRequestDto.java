package com.example.wherewego.domain.courses.dto.request;

import java.util.List;

import com.example.wherewego.common.enums.CourseTheme;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 생성 요청 DTO
 * 새로운 여행 코스를 생성할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseCreateRequestDto {

	/**
	 * 코스에 포함될 장소들의 ID 목록
	 */
	@NotEmpty(message = "장소 선택은 필수입니다.")
	private List<String> placeIds;

	/**
	 * 코스 제목
	 */
	@NotBlank(message = "제목은 필수입니다.")
	private String title;

	/**
	 * 코스 설명
	 */
	private String description;

	/**
	 * 코스 테마 목록 (최대 5개)
	 */
	@Size(max = 5, message = "테마는 최대 5개까지 선택 가능합니다.")
	private List<CourseTheme> themes;

	/**
	 * 코스의 지역 정보
	 */
	@NotBlank(message = "지역은 필수입니다.")
	private String region;

	/**
	 * 코스 공개 여부 (기본값: false)
	 */
	// 기본값 = false(null일 경우)
	private Boolean isPublic;
}
