package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 코스 목록 응답 DTO
 * 코스 목록을 조회할 때 반환하는 응답 데이터 클래스입니다.
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseListResponseDto {
	/**
	 * 코스 고유 식별자
	 */
	private Long courseId;
	/**
	 * 코스 작성자 닉네임
	 */
	private String nickname;
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
	 * 코스에 포함된 장소 정보 목록
	 */
	private List<CoursePlaceInfo> places;
	/**
	 * 코스 좋아요 수
	 */
	private int likeCount;
	/**
	 * 코스 평균 평점
	 */
	private double averageRating;
	/**
	 * 코스 공개 여부
	 */
	private Boolean isPublic;
	/**
	 * 코스 생성 일시
	 */
	private LocalDateTime createdAt;
}
