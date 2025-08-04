package com.example.wherewego.domain.courses.mapper;

import java.util.List;

import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDeleteResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseDetailResponseDto;
import com.example.wherewego.domain.courses.dto.response.CourseListResponseDto;
import com.example.wherewego.domain.courses.dto.response.CoursePlaceInfo;
import com.example.wherewego.domain.courses.dto.response.CourseUpdateResponseDto;
import com.example.wherewego.domain.courses.entity.Course;
import com.example.wherewego.domain.user.entity.User;

public class CourseMapper {

	public static CourseCreateResponseDto toDto(Course course) {
		return CourseCreateResponseDto.builder()
			.courseId(course.getId())
			.userId(course.getUser().getId())
			.title(course.getTitle())
			.description(course.getDescription())
			.themes(course.getThemes())
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
			.themes(request.getThemes())
			.region(request.getRegion())
			.isPublic(request.getIsPublic())
			.user(user)
			.build();
	}

	public static CourseListResponseDto toListWithPlaces(Course course, List<CoursePlaceInfo> places) {
		return CourseListResponseDto.builder()
			.courseId(course.getId())
			.nickname(course.getUser().getNickname())
			.title(course.getTitle())
			.description(course.getDescription())
			.themes(course.getThemes())
			.region(course.getRegion())
			.likeCount(course.getLikeCount())
			.averageRating(course.getAverageRating())
			.isPublic(course.getIsPublic())
			.createdAt(course.getCreatedAt())
			.places(places)
			.build();
	}

	public static CourseDetailResponseDto toDetailDto(Course course, List<CoursePlaceInfo> places) {
		return CourseDetailResponseDto.builder()
			.courseId(course.getId())
			.nickname(course.getUser().getNickname())
			.title(course.getTitle())
			.description(course.getDescription())
			.region(course.getRegion())
			.themes(course.getThemes())
			.places(places)
			.likeCount(course.getLikeCount())
			.averageRating(course.getAverageRating())
			.isPublic(course.getIsPublic())
			.createdAt(course.getCreatedAt())
			.build();
	}

	public static CourseUpdateResponseDto toUpdateDto(Course course) {
		return CourseUpdateResponseDto.builder()
			.courseId(course.getId())
			.userId(course.getUser().getId())
			.title(course.getTitle())
			.description(course.getDescription())
			.themes(course.getThemes())
			.region(course.getRegion())
			.likeCount(course.getLikeCount())
			.averageRating(course.getAverageRating())
			.viewCount(course.getViewCount())
			.commentCount(course.getCommentCount())
			.isPublic(course.getIsPublic())
			.createdAt(course.getCreatedAt())
			.build();
	}

	public static CourseDeleteResponseDto toDeleteResponseDto(Course course) {
		return CourseDeleteResponseDto.builder()
			.courseId(course.getId())
			.deletedAt(course.getDeletedAt())
			.build();
	}
}
