package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.wherewego.domain.common.enums.CourseTheme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseDetailResponseDto {
	private Long courseId;
	private String title;
	private String description;
	private List<CourseTheme> themes;
	private List<CoursePlaceInfo> places;
	private String region;
	private int likeCount;
	private double averageRating;
	private Boolean isPublic;
	private LocalDateTime createdAt;
}
