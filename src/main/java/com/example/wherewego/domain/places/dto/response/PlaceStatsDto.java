package com.example.wherewego.domain.places.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 통계 정보 DTO
 * - place_id(카카오 API ID) 기준 리뷰/북마크 통계 제공
 *
 * 응답 예시:
 * {
 *   "placeId": "253451",
 *   "reviewCount": 156,
 *   "averageRating": 4.24,
 *   "bookmarkCount": 89,
 *   "isBookmarked": true,
 *   "hasUserReview": false
 * }
 */
@Builder
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PlaceStatsDto {

	/**
	 * 카카오 장소 ID
	 */
	private String placeId;

	/**
	 * 총 리뷰 수
	 */
	private Long reviewCount;

	/**
	 * 평균 평점
	 */
	private Double averageRating;

	/**
	 * 총 북마크 수
	 */
	private Long bookmarkCount;

	/**
	 * 사용자별 북마크 여부
	 */
	private Boolean isBookmarked;

	/**
	 * 사용자별 리뷰 작성 여부
	 */
	private Boolean hasUserReview;

}
