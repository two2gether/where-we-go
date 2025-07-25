package com.example.wherewego.domain.courses.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * Course용 장소 정보 DTO (경로 거리 계산 포함)
 *
 * Course 도메인에서 장소 정보와 경로 거리가 필요할 때 사용하는 응답 DTO
 * 사용자 위치로부터의 거리와 이전 장소로부터의 이동거리 모두 포함
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePlaceInfo {

	/**
	 * 장소 고유 ID (Google place_id)
	 */
	private String placeId;

	/**
	 * 장소 이름
	 */
	private String name;

	/**
	 * 장소 카테고리
	 */
	private String category;

	/**
	 * 위도
	 */
	private Double latitude;

	/**
	 * 경도
	 */
	private Double longitude;

	/**
	 * 사용자 위치로부터의 직선거리 (미터)
	 * 사용자 위치 정보 없으면 null
	 */
	private Integer distanceFromUser;

	/**
	 * 이전 장소로부터의 이동거리 (미터)
	 * 첫번째 장소는 null
	 */
	private Integer distanceFromPrevious;

	/**
	 * 코스 내 방문 순서
	 */
	private Integer visitOrder;

	/**
	 * 장소 대표 이미지 URL
	 * Google Photos API에서 제공
	 */
	private String imageUrl;
}
