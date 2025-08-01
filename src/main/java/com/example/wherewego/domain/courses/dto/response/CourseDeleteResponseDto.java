package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 삭제 응답 DTO
 * 코스가 삭제되었을 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseDeleteResponseDto {
	/**
	 * 삭제된 코스의 고유 식별자
	 */
	private Long courseId;
	/**
	 * 코스 삭제 일시
	 */
	private LocalDateTime deletedAt;
}
