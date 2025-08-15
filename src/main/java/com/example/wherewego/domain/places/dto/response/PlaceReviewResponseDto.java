package com.example.wherewego.domain.places.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 장소 리뷰 응답 DTO
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaceReviewResponseDto {

	/**
	 * 리뷰 ID
	 */
	private Long reviewId;

	/**
	 * 장소 ID (Google API)
	 */
	private String placeId;

	/**
	 * 장소 이름
	 */
	private String placeName;

	/**
	 * 작성자 정보
	 */
	private ReviewerInfo reviewer;

	/**
	 * 평점 (1-5점)
	 */
	private Integer rating;

	/**
	 * 리뷰 내용
	 */
	private String content;

	/**
	 * 작성일시
	 */
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
	private LocalDateTime createdAt;

	/**
	 * 수정일시
	 */
	@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
	private LocalDateTime updatedAt;

	/**
	 * 내가 작성한 리뷰인지 여부
	 */
	private Boolean isMyReview;

	/**
	 * 리뷰 작성자 정보
	 */
	@Getter
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class ReviewerInfo {
		/**
		 * 작성자 ID
		 */
		private Long userId;

		/**
		 * 작성자 닉네임
		 */
		private String nickname;

		/**
		 * 작성자 프로필 이미지
		 */
		private String profileImage;
	}
}