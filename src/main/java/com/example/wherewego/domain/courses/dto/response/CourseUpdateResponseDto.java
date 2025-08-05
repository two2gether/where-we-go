package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 수정 응답 DTO
 * 코스가 수정되었을 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseUpdateResponseDto {
	/**
	 * 수정된 코스의 고유 식별자
	 */
	private Long courseId;
	/**
	 * 코스 작성자 ID
	 */
	private Long userId;
	/**
	 * 코스 제목
	 */
	private String title;
	/**
	 * 코스 설명
	 */
	private String description;
	/**
	 * 코스 테마 목록
	 */
	private List<CourseTheme> themes;
	/**
	 * 코스의 지역 정보
	 */
	private String region;
	/**
	 * 코스 좋아요 수
	 */
	private int likeCount;
	/**
	 * 코스 평균 평점
	 */
	private double averageRating;
	/**
	 * 코스 조회 수
	 */
	private int viewCount;
	/**
	 * 코스 댓글 수
	 */
	private int commentCount;
	/**
	 * 코스 공개 여부
	 */
	private Boolean isPublic;
	/**
	 * 코스 생성 일시
	 */
	private LocalDateTime createdAt;
}
