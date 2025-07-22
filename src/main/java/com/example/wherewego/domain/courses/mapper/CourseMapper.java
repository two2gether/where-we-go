package com.example.wherewego.domain.courses.mapper;

import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.user.entity.User;

public class CourseMapper {

	public static CourseCreateResponseDto toDto(Course course) {
		return CourseCreateResponseDto.builder()
			.courseId(course.getId())
			.userId(course.getUser().getId())
			.title(course.getTitle())
			.description(course.getDescription())
			.themes(course.getTheme())
			.region(course.getRegion())
			.likeCount(course.getLikeCount())
			.averageRating(course.getAverageRating())
			.viewCount(course.getViewCount())
			.commentCount(course.getCommentCount())
			.isPublic(course.getIsPublic())
			.createdAt(course.getCreatedAt())
			.build();
	}

	public static Course toEntity(CourseCreateRequestDto request, User user) {
		return Course.builder()
			.title(request.getTitle())
			.description(request.getDescription())
			.theme(request.getThemes())
			.region(request.getRegion())
			.isPublic(request.isPublic())
			.user(user)
			.build();
	}
}
