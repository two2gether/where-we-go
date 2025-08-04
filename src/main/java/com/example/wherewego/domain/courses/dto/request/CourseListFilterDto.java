package com.example.wherewego.domain.courses.dto.request;

import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 목록 필터링 요청 DTO
 * 코스 목록을 조회할 때 지역과 테마로 필터링하기 위한 요청 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class CourseListFilterDto {
	/**
	 * 필터링할 지역 정보
	 */
	@NotBlank(message = "지역은 필수입니다.")
	private String region;
	/**
	 * 필터링할 코스 테마 목록
	 */
	private List<CourseTheme> themes;
}
