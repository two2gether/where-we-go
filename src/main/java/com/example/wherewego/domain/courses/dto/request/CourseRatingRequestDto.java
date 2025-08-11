package com.example.wherewego.domain.courses.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 코스 평점 요청 DTO
 * 코스에 평점을 등록할 때 사용하는 요청 데이터 클래스입니다.
 */
@Getter
@AllArgsConstructor
public class CourseRatingRequestDto {

	@NotNull
	private Long courseId;

	/**
	 * 코스 평점 (1~5점)
	 */
	@NotNull(message = "평점은 필수 입력입니다.")
	@Min(value = 1, message = "평점은 1점이상 5점이하 입니다.")
	@Max(value = 5, message = "평점은 1점이상 5점이하 입니다.")
	private int rating;

}
