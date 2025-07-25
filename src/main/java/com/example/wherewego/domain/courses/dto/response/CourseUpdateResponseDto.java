package com.example.wherewego.domain.courses.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.example.wherewego.common.enums.CourseTheme;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseUpdateResponseDto {
	private Long courseId;
	private Long userId;
	private String title;
	private String description;
	private List<CourseTheme> themes;
	private String region;
	private int likeCount;
	private double averageRating;
	private int viewCount;
	private int commentCount;
	private Boolean isPublic;
	private LocalDateTime createdAt;
}
