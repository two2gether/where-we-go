package com.example.wherewego.domain.courses.mapper;

import com.example.wherewego.domain.courses.dto.request.CourseCreateRequestDto;
import com.example.wherewego.domain.courses.dto.response.CourseCreateResponseDto;
import com.example.wherewego.domain.courses.entity.Course;

public class CourseMapper {

    public static CourseCreateResponseDto toDto(Course course) {
        return CourseCreateResponseDto.builder()
                .courseId(course.getId())
                .userId(course.getUser().getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .theme(course.getCourseThemes())
                .region(course.getRegion())
                .likeCount(course.getLikeCount())
                .averageRating(course.getAverageRating())
                .viewCount(course.getViewCount())
                .commentCount(course.getCommentCount())
                .isPublic(course.isPublic())
                .createdAt(course.getCreatedAt())
                .build();
    }

    public static Course toEntity(CourseCreateRequestDto request, User user) {
        return Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .courseThemes(request.getTheme())
                .region(request.getRegion())
                .isPublic(request.getIsPublic())
                .user(user)
                .build();
    }
}
