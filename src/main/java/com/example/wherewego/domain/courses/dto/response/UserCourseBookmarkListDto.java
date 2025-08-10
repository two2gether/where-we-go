package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 내가 북마크한 코스 목록 응답 DTO
 *
 * 사용 API: GET /api/users/mypage/coursebookmark
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCourseBookmarkListDto {

	private Long courseId;
	private String title;
	private String description;

	private List<CourseTheme> themes;
	private String region;
	private int likeCount;
	private double averageRating;
	private Boolean isPublic;
	private List<CoursePlaceInfo> places;
	private LocalDateTime createdAt;         // 코스 생성일
	private LocalDateTime bookmarkCreatedAt; // 북마크한 날짜
	private Boolean isMine;                  // 현재 사용자가 생성한 코스인지 여부

}