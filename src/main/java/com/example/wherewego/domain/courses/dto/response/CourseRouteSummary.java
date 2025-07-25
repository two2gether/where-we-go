package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Course 경로 요약 정보 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseRouteSummary {

	/**
	 * 총 경로 거리
	 */
	private Integer totalDistance;

	/**
	 * 총 장소 개수
	 */
	private Integer placeCount;
}

